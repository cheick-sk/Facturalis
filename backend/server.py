from fastapi import FastAPI, APIRouter, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from database import get_db, engine, Base
from models import User, Client, Invoice, InvoiceItem, Quote, QuoteItem, Activity
import schemas
from auth import get_password_hash, verify_password, create_access_token, get_current_user
from datetime import datetime, timedelta
import logging
from pathlib import Path
from dotenv import load_dotenv
import os

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create database tables
try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully")
except Exception as e:
    logger.error(f"Error creating database tables: {e}")
    raise

# Create the main app
app = FastAPI(title="InvoiceFlow API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Helper function to log activities
def log_activity(db: Session, user_id: str, description: str):
    activity = Activity(user_id=user_id, description=description)
    db.add(activity)
    db.commit()

# Helper function to generate invoice number
def generate_invoice_number(db: Session) -> str:
    count = db.query(Invoice).count()
    return f"INV{str(count + 1).zfill(3)}"

# Helper function to generate quote number
def generate_quote_number(db: Session) -> str:
    count = db.query(Quote).count()
    return f"QUOTE{str(count + 1).zfill(3)}"

# ============ AUTH ROUTES ============
@api_router.post("/register", response_model=schemas.User)
async def register(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    db_user = db.query(User).filter(User.email == user_data.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        name=user_data.name,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@api_router.post("/login", response_model=schemas.Token)
async def login(user_data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token = create_access_token(data={"sub": user.id})
    return {"access_token": access_token, "token_type": "bearer"}

@api_router.get("/me", response_model=schemas.User)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

# ============ CLIENT ROUTES ============
@api_router.post("/clients", response_model=schemas.Client)
async def create_client(
    client_data: schemas.ClientCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_client = Client(**client_data.dict(), user_id=current_user.id)
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    
    log_activity(db, current_user.id, f"Nouveau client ajouté: {client_data.name}")
    return db_client

@api_router.get("/clients", response_model=list[schemas.Client])
async def get_clients(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    clients = db.query(Client).filter(Client.user_id == current_user.id).all()
    return clients

@api_router.get("/clients/{client_id}", response_model=schemas.Client)
async def get_client(
    client_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    client = db.query(Client).filter(
        Client.id == client_id,
        Client.user_id == current_user.id
    ).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client

@api_router.put("/clients/{client_id}", response_model=schemas.Client)
async def update_client(
    client_id: str,
    client_data: schemas.ClientCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_client = db.query(Client).filter(
        Client.id == client_id,
        Client.user_id == current_user.id
    ).first()
    if not db_client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    for key, value in client_data.dict().items():
        setattr(db_client, key, value)
    
    db.commit()
    db.refresh(db_client)
    
    log_activity(db, current_user.id, f"Client modifié: {client_data.name}")
    return db_client

@api_router.delete("/clients/{client_id}")
async def delete_client(
    client_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_client = db.query(Client).filter(
        Client.id == client_id,
        Client.user_id == current_user.id
    ).first()
    if not db_client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    client_name = db_client.name
    db.delete(db_client)
    db.commit()
    
    log_activity(db, current_user.id, f"Client supprimé: {client_name}")
    return {"message": "Client deleted"}

# ============ INVOICE ROUTES ============
@api_router.post("/invoices", response_model=schemas.Invoice)
async def create_invoice(
    invoice_data: schemas.InvoiceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Calculate total amount
    total_amount = sum(item.quantity * item.price for item in invoice_data.items)
    
    # Create invoice
    db_invoice = Invoice(
        invoice_number=generate_invoice_number(db),
        client_id=invoice_data.client_id,
        user_id=current_user.id,
        due_date=invoice_data.due_date,
        amount=total_amount,
        status=invoice_data.status,
        description=invoice_data.description
    )
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    
    # Create invoice items
    for item_data in invoice_data.items:
        db_item = InvoiceItem(
            invoice_id=db_invoice.id,
            description=item_data.description,
            quantity=item_data.quantity,
            price=item_data.price,
            total=item_data.quantity * item_data.price
        )
        db.add(db_item)
    
    db.commit()
    
    # Get client name for activity log
    client = db.query(Client).filter(Client.id == invoice_data.client_id).first()
    log_activity(db, current_user.id, f"Facture {db_invoice.invoice_number} créée pour {client.name}")
    
    return db_invoice

@api_router.get("/invoices", response_model=list[schemas.Invoice])
async def get_invoices(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    invoices = db.query(Invoice).filter(Invoice.user_id == current_user.id).all()
    return invoices

@api_router.get("/invoices/{invoice_id}", response_model=schemas.Invoice)
async def get_invoice(
    invoice_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    invoice = db.query(Invoice).filter(
        Invoice.id == invoice_id,
        Invoice.user_id == current_user.id
    ).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice

@api_router.put("/invoices/{invoice_id}/status")
async def update_invoice_status(
    invoice_id: str,
    status: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_invoice = db.query(Invoice).filter(
        Invoice.id == invoice_id,
        Invoice.user_id == current_user.id
    ).first()
    if not db_invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    old_status = db_invoice.status
    db_invoice.status = status
    db.commit()
    
    # Log activity based on status change
    if status == "Payé":
        log_activity(db, current_user.id, f"Facture {db_invoice.invoice_number} payée")
    elif status == "Envoyé":
        log_activity(db, current_user.id, f"Facture {db_invoice.invoice_number} envoyée")
    
    return {"message": f"Invoice status updated from {old_status} to {status}"}

# ============ DASHBOARD ROUTES ============
@api_router.get("/dashboard", response_model=schemas.DashboardData)
async def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Calculate metrics
    total_revenue = db.query(func.sum(Invoice.amount)).filter(
        Invoice.user_id == current_user.id,
        Invoice.status == "Payé"
    ).scalar() or 0
    
    total_invoices = db.query(Invoice).filter(Invoice.user_id == current_user.id).count()
    total_clients = db.query(Client).filter(Client.user_id == current_user.id).count()
    
    pending_amount = db.query(func.sum(Invoice.amount)).filter(
        Invoice.user_id == current_user.id,
        Invoice.status.in_(["Envoyé", "En retard"])
    ).scalar() or 0
    
    # Recent invoices
    recent_invoices = db.query(Invoice).filter(
        Invoice.user_id == current_user.id
    ).order_by(desc(Invoice.created_at)).limit(5).all()
    
    recent_invoices_data = []
    for inv in recent_invoices:
        client = db.query(Client).filter(Client.id == inv.client_id).first()
        recent_invoices_data.append({
            "invoice_id": inv.invoice_number,
            "client": client.name if client else "Unknown",
            "date": inv.date.strftime("%d %B %Y"),
            "amount": f"{inv.amount:,.2f} €",
            "status": inv.status
        })
    
    # Recent activities
    recent_activities = db.query(Activity).filter(
        Activity.user_id == current_user.id
    ).order_by(desc(Activity.created_at)).limit(5).all()
    
    # Top clients
    top_clients = db.query(
        Client.id,
        Client.name,
        Client.email,
        Client.status,
        func.sum(Invoice.amount).label('revenue')
    ).join(Invoice).filter(
        Client.user_id == current_user.id,
        Invoice.status == "Payé"
    ).group_by(Client.id, Client.name, Client.email, Client.status).order_by(
        desc('revenue')
    ).limit(5).all()
    
    top_clients_data = []
    for client in top_clients:
        top_clients_data.append({
            "client_id": client.id[:2].upper(),
            "name": client.name,
            "email": client.email,
            "revenue": f"{client.revenue:,.2f} €",
            "status": client.status
        })
    
    return {
        "metrics": {
            "revenue": total_revenue,
            "revenue_change": 12.5,  # Mock data - implement proper calculation
            "invoices_count": total_invoices,
            "invoices_change": 8.2,  # Mock data
            "clients_count": total_clients,
            "clients_change": 15.1,  # Mock data
            "pending_amount": pending_amount,
            "pending_change": 3.2  # Mock data
        },
        "recent_invoices": recent_invoices_data,
        "recent_activities": recent_activities,
        "top_clients": top_clients_data
    }

# ============ BASIC ROUTES ============
@api_router.get("/")
async def root():
    return {"message": "InvoiceFlow API is running!"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# Include the router in the main app
app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)