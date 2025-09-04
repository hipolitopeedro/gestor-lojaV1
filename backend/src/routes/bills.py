from flask import Blueprint, request, jsonify
from datetime import datetime, date
from src.models.user_simple import db, User
from src.models.bill import Bill
from src.utils.auth import basic_auth_required

bills_bp = Blueprint('bills', __name__)

@bills_bp.route('/api/bills', methods=['GET'])
@basic_auth_required
def get_bills(user):
    """Get all bills for the authenticated user"""
    try:
        current_user_id = user.id
        
        # Get query parameters
        status = request.args.get('status')  # pending, paid, overdue, all
        category = request.args.get('category')
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)
        
        # Build query
        query = Bill.query.filter_by(user_id=current_user_id)
        
        if status and status != 'all':
            if status == 'overdue':
                # Get bills that are pending and past due date
                query = query.filter(
                    Bill.status == 'pending',
                    Bill.due_date < date.today()
                )
            else:
                query = query.filter_by(status=status)
        
        if category:
            query = query.filter_by(category=category)
        
        # Order by due date (ascending for pending, descending for paid)
        if status == 'paid':
            query = query.order_by(Bill.payment_date.desc())
        else:
            query = query.order_by(Bill.due_date.asc())
        
        # Apply pagination
        bills = query.offset(offset).limit(limit).all()
        
        # Get total count
        total_count = query.count()
        
        # Convert to dict and add computed fields
        bills_data = []
        for bill in bills:
            bill_dict = bill.to_dict()
            bill_dict['is_overdue'] = bill.is_overdue()
            bill_dict['days_until_due'] = bill.days_until_due()
            bills_data.append(bill_dict)
        
        return jsonify({
            'bills': bills_data,
            'total_count': total_count,
            'has_more': (offset + limit) < total_count
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bills_bp.route('/api/bills', methods=['POST'])
@basic_auth_required
def create_bill(user):
    """Create a new bill"""
    try:
        current_user_id = user.id
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['title', 'category', 'original_amount', 'due_date']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Parse due date
        try:
            due_date = datetime.strptime(data['due_date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Invalid due_date format. Use YYYY-MM-DD'}), 400
        
        # Create bill
        bill = Bill(
            user_id=current_user_id,
            barcode=data.get('barcode'),
            line_code=data.get('line_code'),
            title=data['title'],
            company=data.get('company'),
            category=data['category'],
            original_amount=float(data['original_amount']),
            discount_amount=float(data.get('discount_amount', 0)),
            interest_amount=float(data.get('interest_amount', 0)),
            due_date=due_date,
            notes=data.get('notes')
        )
        
        # Calculate final amount
        bill.calculate_final_amount()
        
        db.session.add(bill)
        db.session.commit()
        
        return jsonify({
            'message': 'Bill created successfully',
            'bill': bill.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bills_bp.route('/api/bills/<int:bill_id>', methods=['GET'])
@basic_auth_required
def get_bill(bill_id):
    """Get a specific bill"""
    try:
        current_user_id = user.id
        
        bill = Bill.query.filter_by(id=bill_id, user_id=current_user_id).first()
        if not bill:
            return jsonify({'error': 'Bill not found'}), 404
        
        bill_dict = bill.to_dict()
        bill_dict['is_overdue'] = bill.is_overdue()
        bill_dict['days_until_due'] = bill.days_until_due()
        
        return jsonify({'bill': bill_dict}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bills_bp.route('/api/bills/<int:bill_id>', methods=['PUT'])
@basic_auth_required
def update_bill(bill_id):
    """Update a bill"""
    try:
        current_user_id = user.id
        data = request.get_json()
        
        bill = Bill.query.filter_by(id=bill_id, user_id=current_user_id).first()
        if not bill:
            return jsonify({'error': 'Bill not found'}), 404
        
        # Update fields
        if 'title' in data:
            bill.title = data['title']
        if 'company' in data:
            bill.company = data['company']
        if 'category' in data:
            bill.category = data['category']
        if 'original_amount' in data:
            bill.original_amount = float(data['original_amount'])
        if 'discount_amount' in data:
            bill.discount_amount = float(data['discount_amount'])
        if 'interest_amount' in data:
            bill.interest_amount = float(data['interest_amount'])
        if 'due_date' in data:
            bill.due_date = datetime.strptime(data['due_date'], '%Y-%m-%d').date()
        if 'notes' in data:
            bill.notes = data['notes']
        
        # Recalculate final amount
        bill.calculate_final_amount()
        bill.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Bill updated successfully',
            'bill': bill.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bills_bp.route('/api/bills/<int:bill_id>/pay', methods=['POST'])
@basic_auth_required
def pay_bill(bill_id):
    """Mark a bill as paid"""
    try:
        current_user_id = user.id
        data = request.get_json()
        
        bill = Bill.query.filter_by(id=bill_id, user_id=current_user_id).first()
        if not bill:
            return jsonify({'error': 'Bill not found'}), 404
        
        if bill.status == 'paid':
            return jsonify({'error': 'Bill is already paid'}), 400
        
        # Validate payment data
        payment_method = data.get('payment_method')
        if not payment_method:
            return jsonify({'error': 'payment_method is required'}), 400
        
        payment_fee = float(data.get('payment_fee', 0))
        
        # Mark as paid
        bill.mark_as_paid(payment_method, payment_fee)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Bill paid successfully',
            'bill': bill.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bills_bp.route('/api/bills/<int:bill_id>', methods=['DELETE'])
@basic_auth_required
def delete_bill(bill_id):
    """Delete a bill"""
    try:
        current_user_id = user.id
        
        bill = Bill.query.filter_by(id=bill_id, user_id=current_user_id).first()
        if not bill:
            return jsonify({'error': 'Bill not found'}), 404
        
        db.session.delete(bill)
        db.session.commit()
        
        return jsonify({'message': 'Bill deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bills_bp.route('/api/bills/scan-barcode', methods=['POST'])
@basic_auth_required
def scan_barcode(user):
    """Process barcode data and create bill"""
    try:
        current_user_id = user.id
        data = request.get_json()
        
        barcode = data.get('barcode')
        line_code = data.get('line_code')
        
        if not barcode and not line_code:
            return jsonify({'error': 'Either barcode or line_code is required'}), 400
        
        # Create bill from barcode data
        barcode_data = {
            'barcode': barcode,
            'line_code': line_code
        }
        
        bill = Bill.create_from_barcode(current_user_id, barcode_data)
        
        db.session.add(bill)
        db.session.commit()
        
        return jsonify({
            'message': 'Bill created from barcode successfully',
            'bill': bill.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bills_bp.route('/api/bills/summary', methods=['GET'])
@basic_auth_required
def get_bills_summary(user):
    """Get bills summary statistics"""
    try:
        current_user_id = user.id
        
        # Get all bills for user
        bills = Bill.query.filter_by(user_id=current_user_id).all()
        
        # Calculate statistics
        total_bills = len(bills)
        pending_bills = len([b for b in bills if b.status == 'pending'])
        paid_bills = len([b for b in bills if b.status == 'paid'])
        overdue_bills = len([b for b in bills if b.is_overdue()])
        
        # Financial totals
        total_pending_amount = sum([float(b.final_amount) for b in bills if b.status == 'pending'])
        total_paid_amount = sum([float(b.final_amount) for b in bills if b.status == 'paid'])
        total_overdue_amount = sum([float(b.final_amount) for b in bills if b.is_overdue()])
        
        # Bills due this week
        today = date.today()
        week_end = date.fromordinal(today.toordinal() + 7)
        bills_due_this_week = len([
            b for b in bills 
            if b.status == 'pending' and today <= b.due_date <= week_end
        ])
        
        # Category breakdown
        categories = {}
        for bill in bills:
            if bill.category not in categories:
                categories[bill.category] = {
                    'count': 0,
                    'total_amount': 0,
                    'pending_amount': 0
                }
            categories[bill.category]['count'] += 1
            categories[bill.category]['total_amount'] += float(bill.final_amount)
            if bill.status == 'pending':
                categories[bill.category]['pending_amount'] += float(bill.final_amount)
        
        return jsonify({
            'summary': {
                'total_bills': total_bills,
                'pending_bills': pending_bills,
                'paid_bills': paid_bills,
                'overdue_bills': overdue_bills,
                'bills_due_this_week': bills_due_this_week,
                'total_pending_amount': total_pending_amount,
                'total_paid_amount': total_paid_amount,
                'total_overdue_amount': total_overdue_amount,
                'categories': categories
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

