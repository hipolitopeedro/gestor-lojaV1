from flask import Blueprint, request, jsonify
from datetime import datetime
from src.models.user_simple import db, User
from src.models.transaction import Transaction, Category
from src.utils.auth import basic_auth_required

transactions_bp = Blueprint('transactions', __name__)

# Card fee rates (example rates)
CARD_FEES = {
    'credito': 0.035,  # 3.5%
    'debito': 0.015,   # 1.5%
    'pix': 0.0,        # 0%
    'dinheiro': 0.0,   # 0%
    'boleto': 0.02     # 2%
}

@transactions_bp.route('/transactions', methods=['GET'])
@basic_auth_required
def get_transactions(user):
    try:
        user_id = user.id
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        transaction_type = request.args.get('type')  # 'income' or 'expense'
        category = request.args.get('category')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        query = Transaction.query.filter_by(user_id=user_id)
        
        # Apply filters
        if transaction_type:
            query = query.filter_by(type=transaction_type)
        if category:
            query = query.filter_by(category=category)
        if start_date:
            query = query.filter(Transaction.date >= datetime.fromisoformat(start_date))
        if end_date:
            query = query.filter(Transaction.date <= datetime.fromisoformat(end_date))
        
        # Order by date (most recent first)
        query = query.order_by(Transaction.date.desc())
        
        # Paginate
        transactions = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'transactions': [t.to_dict() for t in transactions.items],
            'total': transactions.total,
            'pages': transactions.pages,
            'current_page': page,
            'per_page': per_page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@transactions_bp.route('/transactions', methods=['POST'])
@basic_auth_required
def create_transaction(user):
    try:
        user_id = user.id
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['type', 'amount', 'description', 'category']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Calculate card fee and net amount
        amount = float(data['amount'])
        payment_method = data.get('payment_method', '').lower()
        card_fee = 0.0
        
        if payment_method in CARD_FEES:
            card_fee = amount * CARD_FEES[payment_method]
        
        net_amount = amount - card_fee
        
        # Parse date
        transaction_date = datetime.utcnow()
        if 'date' in data and data['date']:
            try:
                transaction_date = datetime.fromisoformat(data['date'].replace('Z', '+00:00'))
            except:
                pass
        
        # Create transaction
        transaction = Transaction(
            user_id=user_id,
            type=data['type'],
            amount=amount,
            description=data['description'],
            category=data['category'],
            payment_method=data.get('payment_method'),
            card_fee=card_fee,
            net_amount=net_amount,
            date=transaction_date,
            notes=data.get('notes')
        )
        
        db.session.add(transaction)
        db.session.commit()
        
        return jsonify({
            'message': 'Transaction created successfully',
            'transaction': transaction.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@transactions_bp.route('/transactions/<int:transaction_id>', methods=['GET'])
@basic_auth_required
def get_transaction(user, transaction_id):
    try:
        user_id = user.id
        transaction = Transaction.query.filter_by(
            id=transaction_id, user_id=user_id
        ).first()
        
        if not transaction:
            return jsonify({'error': 'Transaction not found'}), 404
        
        return jsonify({'transaction': transaction.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@transactions_bp.route('/transactions/<int:transaction_id>', methods=['PUT'])
@basic_auth_required
def update_transaction(user, transaction_id):
    try:
        user_id = user.id
        transaction = Transaction.query.filter_by(
            id=transaction_id, user_id=user_id
        ).first()
        
        if not transaction:
            return jsonify({'error': 'Transaction not found'}), 404
        
        data = request.get_json()
        
        # Update fields
        if 'amount' in data:
            amount = float(data['amount'])
            payment_method = data.get('payment_method', transaction.payment_method or '').lower()
            card_fee = 0.0
            
            if payment_method in CARD_FEES:
                card_fee = amount * CARD_FEES[payment_method]
            
            transaction.amount = amount
            transaction.card_fee = card_fee
            transaction.net_amount = amount - card_fee
        
        if 'description' in data:
            transaction.description = data['description']
        if 'category' in data:
            transaction.category = data['category']
        if 'payment_method' in data:
            transaction.payment_method = data['payment_method']
        if 'notes' in data:
            transaction.notes = data['notes']
        if 'date' in data and data['date']:
            try:
                transaction.date = datetime.fromisoformat(data['date'].replace('Z', '+00:00'))
            except:
                pass
        
        transaction.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Transaction updated successfully',
            'transaction': transaction.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@transactions_bp.route('/transactions/<int:transaction_id>', methods=['DELETE'])
@basic_auth_required
def delete_transaction(user, transaction_id):
    try:
        user_id = user.id
        transaction = Transaction.query.filter_by(
            id=transaction_id, user_id=user_id
        ).first()
        
        if not transaction:
            return jsonify({'error': 'Transaction not found'}), 404
        
        db.session.delete(transaction)
        db.session.commit()
        
        return jsonify({'message': 'Transaction deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@transactions_bp.route('/categories', methods=['GET'])
@basic_auth_required
def get_categories(user):
    try:
        user_id = user.id
        category_type = request.args.get('type')  # 'income' or 'expense'
        
        query = Category.query.filter_by(user_id=user_id)
        if category_type:
            query = query.filter_by(type=category_type)
        
        categories = query.order_by(Category.name).all()
        
        return jsonify({
            'categories': [c.to_dict() for c in categories]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@transactions_bp.route('/categories', methods=['POST'])
@basic_auth_required
def create_category(user):
    try:
        user_id = user.id
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'type']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Check if category already exists
        existing = Category.query.filter_by(
            user_id=user_id, name=data['name'], type=data['type']
        ).first()
        
        if existing:
            return jsonify({'error': 'Category already exists'}), 400
        
        category = Category(
            user_id=user_id,
            name=data['name'],
            type=data['type'],
            color=data.get('color'),
            icon=data.get('icon')
        )
        
        db.session.add(category)
        db.session.commit()
        
        return jsonify({
            'message': 'Category created successfully',
            'category': category.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@transactions_bp.route('/dashboard/summary', methods=['GET'])
@basic_auth_required
def get_dashboard_summary(user):
    try:
        user_id = user.id
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        query = Transaction.query.filter_by(user_id=user_id)
        
        if start_date:
            query = query.filter(Transaction.date >= datetime.fromisoformat(start_date))
        if end_date:
            query = query.filter(Transaction.date <= datetime.fromisoformat(end_date))
        
        transactions = query.all()
        
        # Calculate summary
        total_income = sum(t.net_amount for t in transactions if t.type == 'income')
        total_expenses = sum(t.net_amount for t in transactions if t.type == 'expense')
        total_fees = sum(t.card_fee for t in transactions)
        net_profit = total_income - total_expenses
        
        # Payment method breakdown
        payment_methods = {}
        for t in transactions:
            if t.payment_method:
                method = t.payment_method
                if method not in payment_methods:
                    payment_methods[method] = {'amount': 0, 'count': 0, 'fees': 0}
                payment_methods[method]['amount'] += t.net_amount
                payment_methods[method]['count'] += 1
                payment_methods[method]['fees'] += t.card_fee
        
        # Category breakdown
        categories = {}
        for t in transactions:
            if t.category not in categories:
                categories[t.category] = {'income': 0, 'expense': 0, 'count': 0}
            categories[t.category][t.type] += t.net_amount
            categories[t.category]['count'] += 1
        
        return jsonify({
            'summary': {
                'total_income': total_income,
                'total_expenses': total_expenses,
                'net_profit': net_profit,
                'total_fees': total_fees,
                'transaction_count': len(transactions)
            },
            'payment_methods': payment_methods,
            'categories': categories
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

