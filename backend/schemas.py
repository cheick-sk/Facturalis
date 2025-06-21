from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    name: str
    company_name: Optional[str] = None
    siret: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    company_name: Optional[str] = None
    siret: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None

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
    siret: Optional[str] = None
    contact_person: Optional[str] = None
    notes: Optional[str] = None

class ClientCreate(ClientBase):
    pass

class Client(ClientBase):
    id: str
    user_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Product/Service Schemas
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    unit: str = "pièce"
    category: Optional[str] = None
    is_service: bool = False

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: str
    user_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Expense Schemas
class ExpenseBase(BaseModel):
    title: str
    description: Optional[str] = None
    amount: float
    category: str
    expense_date: Optional[datetime] = None
    is_billable: bool = False
    client_id: Optional[str] = None
    status: str = "En attente"

class ExpenseCreate(ExpenseBase):
    pass

class Expense(ExpenseBase):
    id: str
    user_id: str
    receipt_path: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Invoice Item Schemas
class InvoiceItemBase(BaseModel):
    description: str
    quantity: float = 1
    price: float
    tax_rate: float = 20.0
    product_id: Optional[str] = None

class InvoiceItemCreate(InvoiceItemBase):
    pass

class InvoiceItem(InvoiceItemBase):
    id: str
    total: float
    
    class Config:
        from_attributes = True

# Invoice Schemas
class InvoiceBase(BaseModel):
    client_id: Optional[str] = None  # Permet None
    due_date: Optional[datetime] = None
    status: str = "Brouillon"
    description: Optional[str] = None
    notes: Optional[str] = None
    payment_terms: Optional[str] = None
    discount: float = 0.0
    quote_id: Optional[str] = None

class InvoiceCreate(InvoiceBase):
    client_id: str  # Obligatoire à la création
    items: List[InvoiceItemCreate] = []

class Invoice(InvoiceBase):
    id: str
    invoice_number: str
    user_id: str
    date: datetime
    amount: float
    tax_amount: float
    created_at: datetime
    items: List[InvoiceItem] = []
    
    class Config:
        from_attributes = True

# Quote Item Schemas
class QuoteItemBase(BaseModel):
    description: str
    quantity: float = 1
    price: float
    tax_rate: float = 20.0
    product_id: Optional[str] = None

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
    expiry_date: Optional[datetime] = None
    status: str = "Brouillon"
    description: Optional[str] = None
    notes: Optional[str] = None
    discount: float = 0.0

class QuoteCreate(QuoteBase):
    items: List[QuoteItemCreate] = []

class Quote(QuoteBase):
    id: str
    quote_number: str
    user_id: str
    date: datetime
    amount: float
    tax_amount: float
    created_at: datetime
    items: List[QuoteItem] = []
    
    class Config:
        from_attributes = True

# Activity Schemas
class ActivityBase(BaseModel):
    description: str
    activity_type: str = "general"
    related_id: Optional[str] = None

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
    expenses_total: float
    quotes_count: int
    quotes_pending: int

class RecentInvoice(BaseModel):
    invoice_id: str
    client: str
    date: str
    amount: str
    status: str

class RecentQuote(BaseModel):
    quote_id: str
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

class ExpenseSummary(BaseModel):
    category: str
    amount: float
    count: int

class DashboardData(BaseModel):
    metrics: DashboardMetrics
    recent_invoices: List[RecentInvoice]
    recent_quotes: List[RecentQuote]
    recent_activities: List[Activity]
    top_clients: List[TopClient]
    expenses_by_category: List[ExpenseSummary]

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Report Schemas
class FinancialReport(BaseModel):
    period: str
    total_revenue: float
    total_expenses: float
    profit: float
    invoices_paid: int
    invoices_pending: int
    quotes_accepted: int
    quotes_pending: int

class CashFlowData(BaseModel):
    month: str
    income: float
    expenses: float
    balance: float