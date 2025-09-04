from datetime import datetime, date
from src.models.user_simple import db

class Bill(db.Model):
    __tablename__ = 'bills'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Bill identification
    barcode = db.Column(db.String(48), nullable=True)  # Código de barras
    line_code = db.Column(db.String(48), nullable=True)  # Linha digitável
    
    # Bill details
    title = db.Column(db.String(200), nullable=False)  # Título/descrição da conta
    company = db.Column(db.String(200), nullable=True)  # Empresa/concessionária
    category = db.Column(db.String(100), nullable=False)  # Categoria (energia, água, etc.)
    
    # Financial information
    original_amount = db.Column(db.Numeric(10, 2), nullable=False)  # Valor original
    discount_amount = db.Column(db.Numeric(10, 2), default=0)  # Desconto
    interest_amount = db.Column(db.Numeric(10, 2), default=0)  # Juros/multa
    final_amount = db.Column(db.Numeric(10, 2), nullable=False)  # Valor final
    
    # Dates
    due_date = db.Column(db.Date, nullable=False)  # Data de vencimento
    payment_date = db.Column(db.Date, nullable=True)  # Data do pagamento
    
    # Status and payment info
    status = db.Column(db.String(20), default='pending')  # pending, paid, overdue, cancelled
    payment_method = db.Column(db.String(50), nullable=True)  # Forma de pagamento
    payment_fee = db.Column(db.Numeric(10, 2), default=0)  # Taxa de pagamento
    
    # Additional info
    notes = db.Column(db.Text, nullable=True)
    receipt_url = db.Column(db.String(500), nullable=True)  # URL do comprovante
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    user = db.relationship('User', backref=db.backref('bills', lazy=True))
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'barcode': self.barcode,
            'line_code': self.line_code,
            'title': self.title,
            'company': self.company,
            'category': self.category,
            'original_amount': float(self.original_amount) if self.original_amount else 0,
            'discount_amount': float(self.discount_amount) if self.discount_amount else 0,
            'interest_amount': float(self.interest_amount) if self.interest_amount else 0,
            'final_amount': float(self.final_amount) if self.final_amount else 0,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'payment_date': self.payment_date.isoformat() if self.payment_date else None,
            'status': self.status,
            'payment_method': self.payment_method,
            'payment_fee': float(self.payment_fee) if self.payment_fee else 0,
            'notes': self.notes,
            'receipt_url': self.receipt_url,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    @classmethod
    def create_from_barcode(cls, user_id, barcode_data):
        """
        Create a bill from barcode data
        This would typically integrate with a barcode processing service
        """
        # Mock implementation - in real app, this would parse barcode data
        bill_info = cls.parse_barcode(barcode_data)
        
        bill = cls(
            user_id=user_id,
            barcode=barcode_data.get('barcode'),
            line_code=barcode_data.get('line_code'),
            title=bill_info.get('title', 'Conta identificada por código de barras'),
            company=bill_info.get('company', 'Empresa não identificada'),
            category=bill_info.get('category', 'Outros'),
            original_amount=bill_info.get('amount', 0),
            final_amount=bill_info.get('amount', 0),
            due_date=bill_info.get('due_date'),
            status='pending'
        )
        
        return bill
    
    @staticmethod
    def parse_barcode(barcode_data):
        """
        Parse barcode data to extract bill information
        This is a mock implementation - real implementation would use proper barcode parsing
        """
        # Mock data based on common Brazilian bill formats
        return {
            'title': 'Conta de Energia Elétrica',
            'company': 'Companhia de Energia',
            'category': 'Energia',
            'amount': 150.75,
            'due_date': datetime.now().date()
        }
    
    def calculate_final_amount(self):
        """Calculate final amount considering discounts and interests"""
        base_amount = float(self.original_amount or 0)
        discount = float(self.discount_amount or 0)
        interest = float(self.interest_amount or 0)
        
        self.final_amount = base_amount - discount + interest
        return self.final_amount
    
    def mark_as_paid(self, payment_method, payment_fee=0):
        """Mark bill as paid"""
        self.status = 'paid'
        self.payment_date = datetime.now().date()
        self.payment_method = payment_method
        self.payment_fee = payment_fee
        self.updated_at = datetime.utcnow()
    
    def is_overdue(self):
        """Check if bill is overdue"""
        if self.status == 'paid':
            return False
        return self.due_date < datetime.now().date()
    
    def days_until_due(self):
        """Calculate days until due date"""
        if self.status == 'paid':
            return 0
        delta = self.due_date - datetime.now().date()
        return delta.days

