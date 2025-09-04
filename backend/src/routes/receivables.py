from flask import Blueprint, request, jsonify
from datetime import datetime, date
from src.models.user_simple import db, User
from src.models.receivable import Receivable, ReceivablePayment, Customer
from src.utils.auth import basic_auth_required

receivables_bp = Blueprint('receivables', __name__)

@receivables_bp.route('/api/receivables', methods=['GET'])
@basic_auth_required
def get_receivables(user):
    """Get all receivables for the authenticated user"""
    try:
        current_user_id = user.id
        
        # Get query parameters
        status = request.args.get('status')  # pending, partial, paid, overdue, all
        type_filter = request.args.get('type')  # fiado, machine_receipt, invoice, other
        customer = request.args.get('customer')
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)
        
        # Build query
        query = Receivable.query.filter_by(user_id=current_user_id)
        
        if status and status != 'all':
            if status == 'overdue':
                # Get receivables that are overdue
                query = query.filter(
                    Receivable.status.in_(['pending', 'partial']),
                    Receivable.due_date < date.today()
                )
            else:
                query = query.filter_by(status=status)
        
        if type_filter:
            query = query.filter_by(type=type_filter)
        
        if customer:
            query = query.filter(Receivable.customer_name.ilike(f'%{customer}%'))
        
        # Order by due date (ascending for pending, descending for paid)
        if status == 'paid':
            query = query.order_by(Receivable.last_payment_date.desc())
        else:
            query = query.order_by(Receivable.due_date.asc())
        
        # Apply pagination
        receivables = query.offset(offset).limit(limit).all()
        
        # Get total count
        total_count = query.count()
        
        # Convert to dict
        receivables_data = [receivable.to_dict() for receivable in receivables]
        
        return jsonify({
            'receivables': receivables_data,
            'total_count': total_count,
            'has_more': (offset + limit) < total_count
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@receivables_bp.route('/api/receivables', methods=['POST'])
@basic_auth_required
def create_receivable(user):
    """Create a new receivable"""
    try:
        current_user_id = user.id
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['customer_name', 'description', 'original_amount', 'due_date']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Parse dates
        try:
            due_date = datetime.strptime(data['due_date'], '%Y-%m-%d').date()
            issue_date = date.today()
            if 'issue_date' in data:
                issue_date = datetime.strptime(data['issue_date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
        
        # Create receivable
        receivable = Receivable(
            user_id=current_user_id,
            customer_name=data['customer_name'],
            customer_phone=data.get('customer_phone'),
            customer_email=data.get('customer_email'),
            customer_address=data.get('customer_address'),
            type=data.get('type', 'fiado'),
            description=data['description'],
            reference_number=data.get('reference_number'),
            original_amount=float(data['original_amount']),
            remaining_amount=float(data['original_amount']),
            interest_rate=float(data.get('interest_rate', 0)),
            late_fee=float(data.get('late_fee', 0)),
            issue_date=issue_date,
            due_date=due_date,
            payment_terms=data.get('payment_terms'),
            notes=data.get('notes'),
            tags=','.join(data.get('tags', [])) if data.get('tags') else None,
            machine_id=data.get('machine_id'),
            machine_location=data.get('machine_location')
        )
        
        db.session.add(receivable)
        db.session.commit()
        
        # Update or create customer record
        update_customer_record(current_user_id, data['customer_name'], data)
        
        return jsonify({
            'message': 'Receivable created successfully',
            'receivable': receivable.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@receivables_bp.route('/api/receivables/<int:receivable_id>', methods=['GET'])
@basic_auth_required
def get_receivable(receivable_id):
    """Get a specific receivable"""
    try:
        current_user_id = user.id
        
        receivable = Receivable.query.filter_by(id=receivable_id, user_id=current_user_id).first()
        if not receivable:
            return jsonify({'error': 'Receivable not found'}), 404
        
        return jsonify({'receivable': receivable.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@receivables_bp.route('/api/receivables/<int:receivable_id>', methods=['PUT'])
@basic_auth_required
def update_receivable(receivable_id):
    """Update a receivable"""
    try:
        current_user_id = user.id
        data = request.get_json()
        
        receivable = Receivable.query.filter_by(id=receivable_id, user_id=current_user_id).first()
        if not receivable:
            return jsonify({'error': 'Receivable not found'}), 404
        
        # Update fields
        if 'customer_name' in data:
            receivable.customer_name = data['customer_name']
        if 'customer_phone' in data:
            receivable.customer_phone = data['customer_phone']
        if 'customer_email' in data:
            receivable.customer_email = data['customer_email']
        if 'customer_address' in data:
            receivable.customer_address = data['customer_address']
        if 'description' in data:
            receivable.description = data['description']
        if 'reference_number' in data:
            receivable.reference_number = data['reference_number']
        if 'original_amount' in data:
            receivable.original_amount = float(data['original_amount'])
            receivable.update_remaining_amount()
        if 'interest_rate' in data:
            receivable.interest_rate = float(data['interest_rate'])
        if 'late_fee' in data:
            receivable.late_fee = float(data['late_fee'])
        if 'due_date' in data:
            receivable.due_date = datetime.strptime(data['due_date'], '%Y-%m-%d').date()
        if 'payment_terms' in data:
            receivable.payment_terms = data['payment_terms']
        if 'notes' in data:
            receivable.notes = data['notes']
        if 'tags' in data:
            receivable.tags = ','.join(data['tags']) if data['tags'] else None
        
        receivable.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Receivable updated successfully',
            'receivable': receivable.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@receivables_bp.route('/api/receivables/<int:receivable_id>/payments', methods=['POST'])
@basic_auth_required
def add_payment(receivable_id):
    """Add a payment to a receivable"""
    try:
        current_user_id = user.id
        data = request.get_json()
        
        receivable = Receivable.query.filter_by(id=receivable_id, user_id=current_user_id).first()
        if not receivable:
            return jsonify({'error': 'Receivable not found'}), 404
        
        if receivable.status == 'paid':
            return jsonify({'error': 'Receivable is already fully paid'}), 400
        
        # Validate payment data
        if 'amount' not in data or 'payment_method' not in data:
            return jsonify({'error': 'amount and payment_method are required'}), 400
        
        amount = float(data['amount'])
        if amount <= 0:
            return jsonify({'error': 'Payment amount must be positive'}), 400
        
        if amount > receivable.remaining_amount:
            return jsonify({'error': 'Payment amount exceeds remaining balance'}), 400
        
        # Add payment
        payment = receivable.add_payment(
            amount=amount,
            payment_method=data['payment_method'],
            notes=data.get('notes')
        )
        
        if 'receipt_number' in data:
            payment.receipt_number = data['receipt_number']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Payment added successfully',
            'payment': payment.to_dict(),
            'receivable': receivable.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@receivables_bp.route('/api/receivables/<int:receivable_id>', methods=['DELETE'])
@basic_auth_required
def delete_receivable(receivable_id):
    """Delete a receivable"""
    try:
        current_user_id = user.id
        
        receivable = Receivable.query.filter_by(id=receivable_id, user_id=current_user_id).first()
        if not receivable:
            return jsonify({'error': 'Receivable not found'}), 404
        
        db.session.delete(receivable)
        db.session.commit()
        
        return jsonify({'message': 'Receivable deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@receivables_bp.route('/api/receivables/summary', methods=['GET'])
@basic_auth_required
def get_receivables_summary(user):
    """Get receivables summary statistics"""
    try:
        current_user_id = user.id
        
        # Get all receivables for user
        receivables = Receivable.query.filter_by(user_id=current_user_id).all()
        
        # Calculate statistics
        total_receivables = len(receivables)
        pending_receivables = len([r for r in receivables if r.status == 'pending'])
        partial_receivables = len([r for r in receivables if r.status == 'partial'])
        paid_receivables = len([r for r in receivables if r.status == 'paid'])
        overdue_receivables = len([r for r in receivables if r.is_overdue()])
        
        # Financial totals
        total_amount = sum([float(r.original_amount) for r in receivables])
        total_pending_amount = sum([float(r.remaining_amount) for r in receivables if r.status != 'paid'])
        total_paid_amount = sum([float(r.paid_amount) for r in receivables])
        total_overdue_amount = sum([float(r.remaining_amount) for r in receivables if r.is_overdue()])
        
        # Receivables due this week
        today = date.today()
        week_end = date.fromordinal(today.toordinal() + 7)
        receivables_due_this_week = len([
            r for r in receivables 
            if r.status in ['pending', 'partial'] and today <= r.due_date <= week_end
        ])
        
        # Type breakdown
        types = {}
        for receivable in receivables:
            if receivable.type not in types:
                types[receivable.type] = {
                    'count': 0,
                    'total_amount': 0,
                    'pending_amount': 0
                }
            types[receivable.type]['count'] += 1
            types[receivable.type]['total_amount'] += float(receivable.original_amount)
            if receivable.status != 'paid':
                types[receivable.type]['pending_amount'] += float(receivable.remaining_amount)
        
        # Top customers
        customers = {}
        for receivable in receivables:
            name = receivable.customer_name
            if name not in customers:
                customers[name] = {
                    'name': name,
                    'total_amount': 0,
                    'pending_amount': 0,
                    'count': 0
                }
            customers[name]['total_amount'] += float(receivable.original_amount)
            customers[name]['count'] += 1
            if receivable.status != 'paid':
                customers[name]['pending_amount'] += float(receivable.remaining_amount)
        
        # Sort customers by total amount
        top_customers = sorted(customers.values(), key=lambda x: x['total_amount'], reverse=True)[:10]
        
        return jsonify({
            'summary': {
                'total_receivables': total_receivables,
                'pending_receivables': pending_receivables,
                'partial_receivables': partial_receivables,
                'paid_receivables': paid_receivables,
                'overdue_receivables': overdue_receivables,
                'receivables_due_this_week': receivables_due_this_week,
                'total_amount': total_amount,
                'total_pending_amount': total_pending_amount,
                'total_paid_amount': total_paid_amount,
                'total_overdue_amount': total_overdue_amount,
                'types': types,
                'top_customers': top_customers
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@receivables_bp.route('/api/customers', methods=['GET'])
@basic_auth_required
def get_customers(user):
    """Get all customers for the authenticated user"""
    try:
        current_user_id = user.id
        
        customers = Customer.query.filter_by(user_id=current_user_id).all()
        customers_data = [customer.to_dict() for customer in customers]
        
        return jsonify({'customers': customers_data}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@receivables_bp.route('/api/customers', methods=['POST'])
@basic_auth_required
def create_customer(user):
    """Create a new customer"""
    try:
        current_user_id = user.id
        data = request.get_json()
        
        if 'name' not in data:
            return jsonify({'error': 'name is required'}), 400
        
        customer = Customer(
            user_id=current_user_id,
            name=data['name'],
            phone=data.get('phone'),
            email=data.get('email'),
            address=data.get('address'),
            document=data.get('document'),
            credit_limit=float(data.get('credit_limit', 0)),
            notes=data.get('notes'),
            tags=','.join(data.get('tags', [])) if data.get('tags') else None
        )
        
        db.session.add(customer)
        db.session.commit()
        
        return jsonify({
            'message': 'Customer created successfully',
            'customer': customer.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

def update_customer_record(user_id, customer_name, customer_data):
    """Update or create customer record"""
    try:
        customer = Customer.query.filter_by(user_id=user_id, name=customer_name).first()
        
        if not customer:
            customer = Customer(
                user_id=user_id,
                name=customer_name,
                phone=customer_data.get('customer_phone'),
                email=customer_data.get('customer_email'),
                address=customer_data.get('customer_address')
            )
            db.session.add(customer)
        else:
            # Update customer info if provided
            if customer_data.get('customer_phone'):
                customer.phone = customer_data['customer_phone']
            if customer_data.get('customer_email'):
                customer.email = customer_data['customer_email']
            if customer_data.get('customer_address'):
                customer.address = customer_data['customer_address']
        
        # Update customer statistics
        customer.update_stats()
        db.session.commit()
        
    except Exception as e:
        db.session.rollback()
        print(f"Error updating customer record: {e}")

