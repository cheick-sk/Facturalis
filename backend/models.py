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
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relations
    clients = relationship("Client", back_populates="user")
    invoices = relationship("Invoice", back_populates="user")
    quotes = relationship("Quote", back_populates="user")
    activities = relationship("Activity", back_populates="user")

class Client(Base):
    __tablename__ = "clients"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String)
    address = Column(Text)
    status = Column(String, default="Actif")  # Actif, Inactif
    user_id = Column(String, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relations
    user = relationship("User", back_populates="clients")
    invoices = relationship("Invoice", back_populates="client")
    quotes = relationship("Quote", back_populates="client")

class Invoice(Base):
    __tablename__ = "invoices"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    invoice_number = Column(String, unique=True, nullable=False)
    client_id = Column(String, ForeignKey("clients.id"))
    user_id = Column(String, ForeignKey("users.id"))
    date = Column(DateTime, default=datetime.utcnow)
    due_date = Column(DateTime)
    amount = Column(Float, nullable=False)
    status = Column(String, default="Brouillon")  # Brouillon, Envoyé, Payé, En retard
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relations
    user = relationship("User", back_populates="invoices")
    client = relationship("Client", back_populates="invoices")
    items = relationship("InvoiceItem", back_populates="invoice")

class InvoiceItem(Base):
    __tablename__ = "invoice_items"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    invoice_id = Column(String, ForeignKey("invoices.id"))
    description = Column(String, nullable=False)
    quantity = Column(Integer, default=1)
    price = Column(Float, nullable=False)
    total = Column(Float, nullable=False)
    
    # Relations
    invoice = relationship("Invoice", back_populates="items")

class Quote(Base):
    __tablename__ = "quotes"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    quote_number = Column(String, unique=True, nullable=False)
    client_id = Column(String, ForeignKey("clients.id"))
    user_id = Column(String, ForeignKey("users.id"))
    date = Column(DateTime, default=datetime.utcnow)
    amount = Column(Float, nullable=False)
    status = Column(String, default="Brouillon")  # Brouillon, Envoyé, Accepté, Refusé
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relations
    user = relationship("User", back_populates="quotes")
    client = relationship("Client", back_populates="quotes")
    items = relationship("QuoteItem", back_populates="quote")

class QuoteItem(Base):
    __tablename__ = "quote_items"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    quote_id = Column(String, ForeignKey("quotes.id"))
    description = Column(String, nullable=False)
    quantity = Column(Integer, default=1)
    price = Column(Float, nullable=False)
    total = Column(Float, nullable=False)
    
    # Relations
    quote = relationship("Quote", back_populates="items")

class Activity(Base):
    __tablename__ = "activities"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"))
    description = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relations
    user = relationship("User", back_populates="activities")