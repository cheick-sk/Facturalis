from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    company_name = Column(String)
    siret = Column(String)
    address = Column(Text)
    phone = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relations
    clients = relationship("Client", back_populates="user")
    invoices = relationship("Invoice", back_populates="user")
    quotes = relationship("Quote", back_populates="user")
    activities = relationship("Activity", back_populates="user")
    expenses = relationship("Expense", back_populates="user")
    products = relationship("Product", back_populates="user")

class Client(Base):
    __tablename__ = "clients"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String)
    address = Column(Text)
    status = Column(String, default="Actif")  # Actif, Inactif
    siret = Column(String)
    contact_person = Column(String)
    notes = Column(Text)
    user_id = Column(String, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relations
    user = relationship("User", back_populates="clients")
    invoices = relationship("Invoice", back_populates="client")
    quotes = relationship("Quote", back_populates="client")

class Product(Base):
    __tablename__ = "products"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    unit = Column(String, default="pièce")  # pièce, heure, jour, etc.
    category = Column(String)
    is_service = Column(Boolean, default=False)
    user_id = Column(String, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relations
    user = relationship("User", back_populates="products")

class Expense(Base):
    __tablename__ = "expenses"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    description = Column(Text)
    amount = Column(Float, nullable=False)
    category = Column(String, nullable=False)  # Transport, Repas, Matériel, etc.
    expense_date = Column(DateTime, default=datetime.utcnow)
    receipt_path = Column(String)  # Chemin vers le justificatif
    is_billable = Column(Boolean, default=False)  # Refacturable au client
    client_id = Column(String, ForeignKey("clients.id"), nullable=True)
    status = Column(String, default="En attente")  # En attente, Approuvé, Refusé
    user_id = Column(String, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relations
    user = relationship("User", back_populates="expenses")
    client = relationship("Client")

class Invoice(Base):
    __tablename__ = "invoices"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    invoice_number = Column(String, unique=True, nullable=False)
    client_id = Column(String, ForeignKey("clients.id"))
    user_id = Column(String, ForeignKey("users.id"))
    date = Column(DateTime, default=datetime.utcnow)
    due_date = Column(DateTime)
    amount = Column(Float, nullable=False)
    tax_amount = Column(Float, default=0.0)
    discount = Column(Float, default=0.0)
    status = Column(String, default="Brouillon")  # Brouillon, Envoyé, Payé, En retard, Annulé
    description = Column(Text)
    notes = Column(Text)
    payment_terms = Column(String)
    quote_id = Column(String, ForeignKey("quotes.id"), nullable=True)  # Si créé depuis un devis
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relations
    user = relationship("User", back_populates="invoices")
    client = relationship("Client", back_populates="invoices")
    items = relationship("InvoiceItem", back_populates="invoice")
    quote = relationship("Quote")

class InvoiceItem(Base):
    __tablename__ = "invoice_items"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    invoice_id = Column(String, ForeignKey("invoices.id"))
    product_id = Column(String, ForeignKey("products.id"), nullable=True)
    description = Column(String, nullable=False)
    quantity = Column(Float, default=1)
    price = Column(Float, nullable=False)
    tax_rate = Column(Float, default=20.0)  # TVA en %
    total = Column(Float, nullable=False)
    
    # Relations
    invoice = relationship("Invoice", back_populates="items")
    product = relationship("Product")

class Quote(Base):
    __tablename__ = "quotes"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    quote_number = Column(String, unique=True, nullable=False)
    client_id = Column(String, ForeignKey("clients.id"))
    user_id = Column(String, ForeignKey("users.id"))
    date = Column(DateTime, default=datetime.utcnow)
    expiry_date = Column(DateTime)
    amount = Column(Float, nullable=False)
    tax_amount = Column(Float, default=0.0)
    discount = Column(Float, default=0.0)
    status = Column(String, default="Brouillon")  # Brouillon, Envoyé, Accepté, Refusé, Expiré
    description = Column(Text)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relations
    user = relationship("User", back_populates="quotes")
    client = relationship("Client", back_populates="quotes")
    items = relationship("QuoteItem", back_populates="quote")

class QuoteItem(Base):
    __tablename__ = "quote_items"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    quote_id = Column(String, ForeignKey("quotes.id"))
    product_id = Column(String, ForeignKey("products.id"), nullable=True)
    description = Column(String, nullable=False)
    quantity = Column(Float, default=1)
    price = Column(Float, nullable=False)
    tax_rate = Column(Float, default=20.0)
    total = Column(Float, nullable=False)
    
    # Relations
    quote = relationship("Quote", back_populates="items")
    product = relationship("Product")

class Activity(Base):
    __tablename__ = "activities"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"))
    description = Column(String, nullable=False)
    activity_type = Column(String, default="general")  # invoice, quote, client, expense, etc.
    related_id = Column(String)  # ID de l'objet lié
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relations
    user = relationship("User", back_populates="activities")