from datetime import datetime, date
from src.models.user_simple import db

class Receivable(db.Model):
    __tablename__ = 'receivables'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Customer information
    customer_name = db.Column(db.String(200), nullable=False)
    customer_phone = db.Column(db.String(20), nullable=True)
    customer_email = db.Column(db.String(200), nullable=True)
    customer_address = db.Column(db.Text, nullable=True)
    
    # Receivable details
    type = db.Column(db.String(50), nullable=False)  # 'fiado', 'machine_receipt', 'invoice', 'other'
    description = db.Column(db.String(500), nullable=False)
    reference_number = db.Column(db.String(100), nullable=True)  # Invoice number, receipt number, etc.
    
    # Financial information
    original_amount = db.Column(db.Numeric(10, 2), nullable=False)
    paid_amount = db.Column(db.Numeric(10, 2), default=0)
    remaining_amount = db.Column(db.Numeric(10, 2), nullable=False)
    interest_rate = db.Column(db.Numeric(5, 2), default=0)  # Monthly interest rate
    late_fee = db.Column(db.Numeric(10, 2), default=0)
    
    # Dates
    issue_date = db.Column(db.Date, nullable=False, default=date.today)
    due_date = db.Column(db.Date, nullable=False)
    last_payment_date = db.Column(db.Date, nullable=True)
    
    # Status and payment info
    status = db.Column(db.String(20), default='pending')  # pending, partial, paid, overdue, cancelled
    payment_terms = db.Column(db.String(200), nullable=True)  # Payment terms description
    
    # Additional info
    notes = db.Column(db.Text, nullable=True)
    tags = db.Column(db.String(500), nullable=True)  # Comma-separated tags
    
    # Machine receipt specific fields
    machine_id = db.Column(db.String(100), nullable=True)  # For machine receipts
    machine_location = db.Column(db.String(200), nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    user = db.relationship('User', backref=db.backref('receivables', lazy=True))
    payments = db.relationship('ReceivablePayment', backref='receivable', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'customer_name': self.customer_name,
            'customer_phone': self.customer_phone,
            'customer_email': self.customer_email,
            'customer_address': self.customer_address,
            'type': self.type,
            'description': self.description,
            'reference_number': self.reference_number,
            'original_amount': float(self.original_amount) if self.original_amount else 0,
            'paid_amount': float(self.paid_amount) if self.paid_amount else 0,
            'remaining_amount': float(self.remaining_amount) if self.remaining_amount else 0,
            'interest_rate': float(self.interest_rate) if self.interest_rate else 0,
            'late_fee': float(self.late_fee) if self.late_fee else 0,
            'issue_date': self.issue_date.isoformat() if self.issue_date else None,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'last_payment_date': self.last_payment_date.isoformat() if self.last_payment_date else None,
            'status': self.status,
            'payment_terms': self.payment_terms,
            'notes': self.notes,
            'tags': self.tags.split(',') if self.tags else [],
            'machine_id': self.machine_id,
            'machine_location': self.machine_location,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'payments': [payment.to_dict() for payment in self.payments],
            'is_overdue': self.is_overdue(),
            'days_overdue': self.days_overdue(),
            'total_with_fees': self.calculate_total_with_fees()
        }
    
    def is_overdue(self):
        """Check if receivable is overdue"""
        if self.status in ['paid', 'cancelled']:
            return False
        return self.due_date < date.today()
    
    def days_overdue(self):
        """Calculate days overdue"""
        if not self.is_overdue():
            return 0
        delta = date.today() - self.due_date
        return delta.days
    
    def days_until_due(self):
        """Calculate days until due date"""
        if self.status in ['paid', 'cancelled']:
            return 0
        delta = self.due_date - date.today()
        return delta.days
    
    def calculate_total_with_fees(self):
        """Calculate total amount including interest and late fees"""
        base_amount = float(self.remaining_amount or 0)
        
        if self.is_overdue() and self.interest_rate > 0:
            # Calculate interest for overdue period
            days_overdue = self.days_overdue()
            monthly_rate = float(self.interest_rate) / 100
            daily_rate = monthly_rate / 30
            interest = base_amount * daily_rate * days_overdue
            base_amount += interest
        
        base_amount += float(self.late_fee or 0)
        return round(base_amount, 2)
    
    def update_remaining_amount(self):
        """Update remaining amount based on payments"""
        total_paid = sum([float(payment.amount) for payment in self.payments])
        self.paid_amount = total_paid
        self.remaining_amount = float(self.original_amount) - total_paid
        
        # Update status based on payment
        if self.remaining_amount <= 0:
            self.status = 'paid'
            self.remaining_amount = 0
        elif total_paid > 0:
            self.status = 'partial'
        elif self.is_overdue():
            self.status = 'overdue'
        else:
            self.status = 'pending'
    
    def add_payment(self, amount, payment_method, notes=None):
        """Add a payment to this receivable"""
        payment = ReceivablePayment(
            receivable_id=self.id,
            amount=amount,
            payment_method=payment_method,
            payment_date=date.today(),
            notes=notes
        )
        
        db.session.add(payment)
        self.last_payment_date = date.today()
        self.update_remaining_amount()
        self.updated_at = datetime.utcnow()
        
        return payment


class ReceivablePayment(db.Model):
    __tablename__ = 'receivable_payments'
    
    id = db.Column(db.Integer, primary_key=True)
    receivable_id = db.Column(db.Integer, db.ForeignKey('receivables.id'), nullable=False)
    
    # Payment details
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    payment_method = db.Column(db.String(50), nullable=False)  # PIX, cash, card, etc.
    payment_date = db.Column(db.Date, nullable=False, default=date.today)
    
    # Additional info
    notes = db.Column(db.Text, nullable=True)
    receipt_number = db.Column(db.String(100), nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'receivable_id': self.receivable_id,
            'amount': float(self.amount) if self.amount else 0,
            'payment_method': self.payment_method,
            'payment_date': self.payment_date.isoformat() if self.payment_date else None,
            'notes': self.notes,
            'receipt_number': self.receipt_number,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Customer(db.Model):
    __tablename__ = 'customers'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Customer information
    name = db.Column(db.String(200), nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    email = db.Column(db.String(200), nullable=True)
    address = db.Column(db.Text, nullable=True)
    document = db.Column(db.String(20), nullable=True)  # CPF/CNPJ
    
    # Customer stats
    total_purchases = db.Column(db.Numeric(10, 2), default=0)
    total_paid = db.Column(db.Numeric(10, 2), default=0)
    total_pending = db.Column(db.Numeric(10, 2), default=0)
    
    # Status
    status = db.Column(db.String(20), default='active')  # active, inactive, blocked
    credit_limit = db.Column(db.Numeric(10, 2), default=0)
    
    # Additional info
    notes = db.Column(db.Text, nullable=True)
    tags = db.Column(db.String(500), nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    user = db.relationship('User', backref=db.backref('customers', lazy=True))
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'phone': self.phone,
            'email': self.email,
            'address': self.address,
            'document': self.document,
            'total_purchases': float(self.total_purchases) if self.total_purchases else 0,
            'total_paid': float(self.total_paid) if self.total_paid else 0,
            'total_pending': float(self.total_pending) if self.total_pending else 0,
            'status': self.status,
            'credit_limit': float(self.credit_limit) if self.credit_limit else 0,
            'notes': self.notes,
            'tags': self.tags.split(',') if self.tags else [],
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def update_stats(self):
        """Update customer statistics based on receivables"""
        from sqlalchemy import func
        
        # Get receivables for this customer
        receivables = Receivable.query.filter_by(
            user_id=self.user_id,
            customer_name=self.name
        ).all()
        
        self.total_purchases = sum([float(r.original_amount) for r in receivables])
        self.total_paid = sum([float(r.paid_amount) for r in receivables])
        self.total_pending = sum([float(r.remaining_amount) for r in receivables if r.status != 'cancelled'])
        
        self.updated_at = datetime.utcnow()

