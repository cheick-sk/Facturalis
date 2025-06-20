from fastapi import FastAPI, APIRouter, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, extract
from database import get_db, engine, Base
from models import User, Client, Invoice, InvoiceItem, Quote, QuoteItem, Activity, Expense, Product
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
app = FastAPI(title="InvoiceFlow API", version="2.0.0")

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

# Helper function to log activities
def log_activity(db: Session, user_id: str, description: str, activity_type: str = "general", related_id: str = None):
    activity = Activity(
        user_id=user_id, 
        description=description, 
        activity_type=activity_type,
        related_id=related_id
    )
    db.add(activity)
    db.commit()

# Helper functions for numbering
def generate_invoice_number(db: Session) -> str:
    count = db.query(Invoice).count()
    return f"INV{str(count + 1).zfill(3)}"

def generate_quote_number(db: Session) -> str:
    count = db.query(Quote).count()
    return f"DEV{str(count + 1).zfill(3)}"

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
        company_name=user_data.company_name,
        siret=user_data.siret,
        address=user_data.address,
        phone=user_data.phone,
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

@api_router.put("/me", response_model=schemas.User)
async def update_profile(
    user_data: schemas.UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    for key, value in user_data.dict(exclude_unset=True).items():
        setattr(current_user, key, value)
    
    db.commit()
    db.refresh(current_user)
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
    
    log_activity(db, current_user.id, f"Nouveau client ajouté: {client_data.name}", "client", db_client.id)
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
    
    log_activity(db, current_user.id, f"Client modifié: {client_data.name}", "client", client_id)
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
    
    log_activity(db, current_user.id, f"Client supprimé: {client_name}", "client", client_id)
    return {"message": "Client deleted"}

# ============ PRODUCT ROUTES ============
@api_router.post("/products", response_model=schemas.Product)
async def create_product(
    product_data: schemas.ProductCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_product = Product(**product_data.dict(), user_id=current_user.id)
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    
    log_activity(db, current_user.id, f"Produit/Service créé: {product_data.name}", "product", db_product.id)
    return db_product

@api_router.get("/products", response_model=list[schemas.Product])
async def get_products(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    products = db.query(Product).filter(Product.user_id == current_user.id).all()
    return products

@api_router.put("/products/{product_id}", response_model=schemas.Product)
async def update_product(
    product_id: str,
    product_data: schemas.ProductCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_product = db.query(Product).filter(
        Product.id == product_id,
        Product.user_id == current_user.id
    ).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    for key, value in product_data.dict().items():
        setattr(db_product, key, value)
    
    db.commit()
    db.refresh(db_product)
    
    log_activity(db, current_user.id, f"Produit/Service modifié: {product_data.name}", "product", product_id)
    return db_product

@api_router.delete("/products/{product_id}")
async def delete_product(
    product_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_product = db.query(Product).filter(
        Product.id == product_id,
        Product.user_id == current_user.id
    ).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product_name = db_product.name
    db.delete(db_product)
    db.commit()
    
    log_activity(db, current_user.id, f"Produit/Service supprimé: {product_name}", "product", product_id)
    return {"message": "Product deleted"}

# ============ EXPENSE ROUTES ============
@api_router.post("/expenses", response_model=schemas.Expense)
async def create_expense(
    expense_data: schemas.ExpenseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_expense = Expense(**expense_data.dict(), user_id=current_user.id)
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    
    log_activity(db, current_user.id, f"Dépense créée: {expense_data.title} - {expense_data.amount}€", "expense", db_expense.id)
    return db_expense

@api_router.get("/expenses", response_model=list[schemas.Expense])
async def get_expenses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    expenses = db.query(Expense).filter(Expense.user_id == current_user.id).order_by(desc(Expense.expense_date)).all()
    return expenses

@api_router.put("/expenses/{expense_id}", response_model=schemas.Expense)
async def update_expense(
    expense_id: str,
    expense_data: schemas.ExpenseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.user_id == current_user.id
    ).first()
    if not db_expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    for key, value in expense_data.dict().items():
        setattr(db_expense, key, value)
    
    db.commit()
    db.refresh(db_expense)
    
    log_activity(db, current_user.id, f"Dépense modifiée: {expense_data.title}", "expense", expense_id)
    return db_expense

@api_router.delete("/expenses/{expense_id}")
async def delete_expense(
    expense_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.user_id == current_user.id
    ).first()
    if not db_expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    expense_title = db_expense.title
    db.delete(db_expense)
    db.commit()
    
    log_activity(db, current_user.id, f"Dépense supprimée: {expense_title}", "expense", expense_id)
    return {"message": "Expense deleted"}

# ============ QUOTE ROUTES ============
@api_router.post("/quotes", response_model=schemas.Quote)
async def create_quote(
    quote_data: schemas.QuoteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Calculate total amount and tax
    total_amount = 0
    total_tax = 0
    
    # Create quote
    db_quote = Quote(
        quote_number=generate_quote_number(db),
        client_id=quote_data.client_id,
        user_id=current_user.id,
        expiry_date=quote_data.expiry_date,
        status=quote_data.status,
        description=quote_data.description,
        notes=quote_data.notes,
        discount=quote_data.discount,
        amount=0,  # Will be updated after items
        tax_amount=0
    )
    db.add(db_quote)
    db.commit()
    db.refresh(db_quote)
    
    # Create quote items
    for item_data in quote_data.items:
        item_total = item_data.quantity * item_data.price
        item_tax = item_total * (item_data.tax_rate / 100)
        
        db_item = QuoteItem(
            quote_id=db_quote.id,
            product_id=item_data.product_id,
            description=item_data.description,
            quantity=item_data.quantity,
            price=item_data.price,
            tax_rate=item_data.tax_rate,
            total=item_total
        )
        db.add(db_item)
        
        total_amount += item_total
        total_tax += item_tax
    
    # Apply discount
    if quote_data.discount > 0:
        total_amount -= (total_amount * quote_data.discount / 100)
        total_tax -= (total_tax * quote_data.discount / 100)
    
    # Update quote totals
    db_quote.amount = total_amount
    db_quote.tax_amount = total_tax
    db.commit()
    
    # Get client name for activity log
    client = db.query(Client).filter(Client.id == quote_data.client_id).first()
    log_activity(db, current_user.id, f"Devis {db_quote.quote_number} créé pour {client.name}", "quote", db_quote.id)
    
    return db_quote

@api_router.get("/quotes", response_model=list[schemas.Quote])
async def get_quotes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    quotes = db.query(Quote).filter(Quote.user_id == current_user.id).order_by(desc(Quote.created_at)).all()
    return quotes

@api_router.put("/quotes/{quote_id}/status")
async def update_quote_status(
    quote_id: str,
    status: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_quote = db.query(Quote).filter(
        Quote.id == quote_id,
        Quote.user_id == current_user.id
    ).first()
    if not db_quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    
    old_status = db_quote.status
    db_quote.status = status
    db.commit()
    
    # Log activity based on status change
    if status == "Accepté":
        log_activity(db, current_user.id, f"Devis {db_quote.quote_number} accepté", "quote", quote_id)
    elif status == "Envoyé":
        log_activity(db, current_user.id, f"Devis {db_quote.quote_number} envoyé", "quote", quote_id)
    
    return {"message": f"Quote status updated from {old_status} to {status}"}

@api_router.post("/quotes/{quote_id}/convert", response_model=schemas.Invoice)
async def convert_quote_to_invoice(
    quote_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_quote = db.query(Quote).filter(
        Quote.id == quote_id,
        Quote.user_id == current_user.id
    ).first()
    if not db_quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    
    # Create invoice from quote
    db_invoice = Invoice(
        invoice_number=generate_invoice_number(db),
        client_id=db_quote.client_id,
        user_id=current_user.id,
        amount=db_quote.amount,
        tax_amount=db_quote.tax_amount,
        discount=db_quote.discount,
        status="Brouillon",
        description=db_quote.description,
        notes=db_quote.notes,
        quote_id=quote_id
    )
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    
    # Copy quote items to invoice items
    quote_items = db.query(QuoteItem).filter(QuoteItem.quote_id == quote_id).all()
    for item in quote_items:
        db_item = InvoiceItem(
            invoice_id=db_invoice.id,
            product_id=item.product_id,
            description=item.description,
            quantity=item.quantity,
            price=item.price,
            tax_rate=item.tax_rate,
            total=item.total
        )
        db.add(db_item)
    
    # Update quote status
    db_quote.status = "Accepté"
    db.commit()
    
    log_activity(db, current_user.id, f"Devis {db_quote.quote_number} converti en facture {db_invoice.invoice_number}", "invoice", db_invoice.id)
    
    return db_invoice

# ============ INVOICE ROUTES ============
@api_router.post("/invoices", response_model=schemas.Invoice)
async def create_invoice(
    invoice_data: schemas.InvoiceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Calculate total amount and tax
    total_amount = 0
    total_tax = 0
    
    # Create invoice
    db_invoice = Invoice(
        invoice_number=generate_invoice_number(db),
        client_id=invoice_data.client_id,
        user_id=current_user.id,
        due_date=invoice_data.due_date,
        status=invoice_data.status,
        description=invoice_data.description,
        notes=invoice_data.notes,
        payment_terms=invoice_data.payment_terms,
        discount=invoice_data.discount,
        quote_id=invoice_data.quote_id,
        amount=0,  # Will be updated after items
        tax_amount=0
    )
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    
    # Create invoice items
    for item_data in invoice_data.items:
        item_total = item_data.quantity * item_data.price
        item_tax = item_total * (item_data.tax_rate / 100)
        
        db_item = InvoiceItem(
            invoice_id=db_invoice.id,
            product_id=item_data.product_id,
            description=item_data.description,
            quantity=item_data.quantity,
            price=item_data.price,
            tax_rate=item_data.tax_rate,
            total=item_total
        )
        db.add(db_item)
        
        total_amount += item_total
        total_tax += item_tax
    
    # Apply discount
    if invoice_data.discount > 0:
        total_amount -= (total_amount * invoice_data.discount / 100)
        total_tax -= (total_tax * invoice_data.discount / 100)
    
    # Update invoice totals
    db_invoice.amount = total_amount
    db_invoice.tax_amount = total_tax
    db.commit()
    
    # Get client name for activity log
    client = db.query(Client).filter(Client.id == invoice_data.client_id).first()
    log_activity(db, current_user.id, f"Facture {db_invoice.invoice_number} créée pour {client.name}", "invoice", db_invoice.id)
    
    return db_invoice

@api_router.get("/invoices", response_model=list[schemas.Invoice])
async def get_invoices(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    invoices = db.query(Invoice).filter(Invoice.user_id == current_user.id).order_by(desc(Invoice.created_at)).all()
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
        log_activity(db, current_user.id, f"Facture {db_invoice.invoice_number} payée", "invoice", invoice_id)
    elif status == "Envoyé":
        log_activity(db, current_user.id, f"Facture {db_invoice.invoice_number} envoyée", "invoice", invoice_id)
    
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
    total_quotes = db.query(Quote).filter(Quote.user_id == current_user.id).count()
    quotes_pending = db.query(Quote).filter(
        Quote.user_id == current_user.id,
        Quote.status.in_(["Brouillon", "Envoyé"])
    ).count()
    
    pending_amount = db.query(func.sum(Invoice.amount)).filter(
        Invoice.user_id == current_user.id,
        Invoice.status.in_(["Envoyé", "En retard"])
    ).scalar() or 0
    
    total_expenses = db.query(func.sum(Expense.amount)).filter(
        Expense.user_id == current_user.id
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
    
    # Recent quotes
    recent_quotes = db.query(Quote).filter(
        Quote.user_id == current_user.id
    ).order_by(desc(Quote.created_at)).limit(5).all()
    
    recent_quotes_data = []
    for quote in recent_quotes:
        client = db.query(Client).filter(Client.id == quote.client_id).first()
        recent_quotes_data.append({
            "quote_id": quote.quote_number,
            "client": client.name if client else "Unknown",
            "date": quote.date.strftime("%d %B %Y"),
            "amount": f"{quote.amount:,.2f} €",
            "status": quote.status
        })
    
    # Recent activities
    recent_activities = db.query(Activity).filter(
        Activity.user_id == current_user.id
    ).order_by(desc(Activity.created_at)).limit(8).all()
    
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
    
    # Expenses by category
    expenses_by_category = db.query(
        Expense.category,
        func.sum(Expense.amount).label('amount'),
        func.count(Expense.id).label('count')
    ).filter(Expense.user_id == current_user.id).group_by(Expense.category).all()
    
    expenses_summary = []
    for exp in expenses_by_category:
        expenses_summary.append({
            "category": exp.category,
            "amount": exp.amount,
            "count": exp.count
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
            "pending_change": 3.2,  # Mock data
            "expenses_total": total_expenses,
            "quotes_count": total_quotes,
            "quotes_pending": quotes_pending
        },
        "recent_invoices": recent_invoices_data,
        "recent_quotes": recent_quotes_data,
        "recent_activities": recent_activities,
        "top_clients": top_clients_data,
        "expenses_by_category": expenses_summary
    }

# ============ REPORTS ROUTES ============
@api_router.get("/reports/financial")
async def get_financial_report(
    period: str = "month",  # month, quarter, year
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Calculate period dates
    now = datetime.now()
    if period == "month":
        start_date = now.replace(day=1)
    elif period == "quarter":
        quarter_start = ((now.month - 1) // 3) * 3 + 1
        start_date = now.replace(month=quarter_start, day=1)
    else:  # year
        start_date = now.replace(month=1, day=1)
    
    # Get financial data for period
    revenue = db.query(func.sum(Invoice.amount)).filter(
        Invoice.user_id == current_user.id,
        Invoice.status == "Payé",
        Invoice.date >= start_date
    ).scalar() or 0
    
    expenses = db.query(func.sum(Expense.amount)).filter(
        Expense.user_id == current_user.id,
        Expense.expense_date >= start_date
    ).scalar() or 0
    
    invoices_paid = db.query(Invoice).filter(
        Invoice.user_id == current_user.id,
        Invoice.status == "Payé",
        Invoice.date >= start_date
    ).count()
    
    invoices_pending = db.query(Invoice).filter(
        Invoice.user_id == current_user.id,
        Invoice.status.in_(["Envoyé", "En retard"]),
        Invoice.date >= start_date
    ).count()
    
    quotes_accepted = db.query(Quote).filter(
        Quote.user_id == current_user.id,
        Quote.status == "Accepté",
        Quote.date >= start_date
    ).count()
    
    quotes_pending = db.query(Quote).filter(
        Quote.user_id == current_user.id,
        Quote.status.in_(["Brouillon", "Envoyé"]),
        Quote.date >= start_date
    ).count()
    
    return {
        "period": period,
        "total_revenue": revenue,
        "total_expenses": expenses,
        "profit": revenue - expenses,
        "invoices_paid": invoices_paid,
        "invoices_pending": invoices_pending,
        "quotes_accepted": quotes_accepted,
        "quotes_pending": quotes_pending
    }

@api_router.get("/reports/cashflow")
async def get_cashflow_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get last 12 months data
    cashflow_data = []
    
    for i in range(12):
        # Calculate month start and end
        target_month = datetime.now() - timedelta(days=30*i)
        month_start = target_month.replace(day=1)
        next_month = month_start.replace(month=month_start.month % 12 + 1) if month_start.month < 12 else month_start.replace(year=month_start.year + 1, month=1)
        
        # Income (paid invoices)
        income = db.query(func.sum(Invoice.amount)).filter(
            Invoice.user_id == current_user.id,
            Invoice.status == "Payé",
            Invoice.date >= month_start,
            Invoice.date < next_month
        ).scalar() or 0
        
        # Expenses
        expenses = db.query(func.sum(Expense.amount)).filter(
            Expense.user_id == current_user.id,
            Expense.expense_date >= month_start,
            Expense.expense_date < next_month
        ).scalar() or 0
        
        cashflow_data.append({
            "month": month_start.strftime("%Y-%m"),
            "income": income,
            "expenses": expenses,
            "balance": income - expenses
        })
    
    return {"cashflow": list(reversed(cashflow_data))}

# ============ BASIC ROUTES ============
@api_router.get("/")
async def root():
    return {"message": "InvoiceFlow API v2.0 is running!", "features": ["invoices", "quotes", "expenses", "products", "reports"]}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow(), "version": "2.0.0"}

# Include the router in the main app
app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)