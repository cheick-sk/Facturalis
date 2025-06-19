from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Client Schemas
class ClientBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    status: str = "Actif"

class ClientCreate(ClientBase):
    pass

class Client(ClientBase):
    id: str
    user_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Invoice Item Schemas
class InvoiceItemBase(BaseModel):
    description: str
    quantity: int = 1
    price: float

class InvoiceItemCreate(InvoiceItemBase):
    pass

class InvoiceItem(InvoiceItemBase):
    id: str
    total: float
    
    class Config:
        from_attributes = True

# Invoice Schemas
class InvoiceBase(BaseModel):
    client_id: str
    due_date: Optional[datetime] = None
    status: str = "Brouillon"
    description: Optional[str] = None

class InvoiceCreate(InvoiceBase):
    items: List[InvoiceItemCreate] = []

class Invoice(InvoiceBase):
    id: str
    invoice_number: str
    user_id: str
    date: datetime
    amount: float
    created_at: datetime
    items: List[InvoiceItem] = []
    
    class Config:
        from_attributes = True

# Quote Item Schemas
class QuoteItemBase(BaseModel):
    description: str
    quantity: int = 1
    price: float

class QuoteItemCreate(QuoteItemBase):
    pass

class QuoteItem(QuoteItemBase):
    id: str
    total: float
    
    class Config:
        from_attributes = True

# Quote Schemas
class QuoteBase(BaseModel):
    client_id: str
    status: str = "Brouillon"
    description: Optional[str] = None

class QuoteCreate(QuoteBase):
    items: List[QuoteItemCreate] = []

class Quote(QuoteBase):
    id: str
    quote_number: str
    user_id: str
    date: datetime
    amount: float
    created_at: datetime
    items: List[QuoteItem] = []
    
    class Config:
        from_attributes = True

# Activity Schemas
class ActivityBase(BaseModel):
    description: str

class ActivityCreate(ActivityBase):
    pass

class Activity(ActivityBase):
    id: str
    user_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Dashboard Schemas
class DashboardMetrics(BaseModel):
    revenue: float
    revenue_change: float
    invoices_count: int
    invoices_change: float
    clients_count: int
    clients_change: float
    pending_amount: float
    pending_change: float

class RecentInvoice(BaseModel):
    invoice_id: str
    client: str
    date: str
    amount: str
    status: str

class TopClient(BaseModel):
    client_id: str
    name: str
    email: str
    revenue: str
    status: str

class DashboardData(BaseModel):
    metrics: DashboardMetrics
    recent_invoices: List[RecentInvoice]
    recent_activities: List[Activity]
    top_clients: List[TopClient]

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str