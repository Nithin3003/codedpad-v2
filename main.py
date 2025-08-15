from flask_pymongo import PyMongo
from flask import Flask, redirect, jsonify, render_template, request, session, send_from_directory, flash
import smtplib
import socket
import email.mime.text
import email.mime.multipart
from secrets import token_urlsafe
from pytz import timezone 
from datetime import datetime
from bson.objectid import ObjectId
import os
import hashlib
import re

app = Flask(__name__) 

# Official hosted MongoDB
os.environ["url"] = "mongodb+srv://msnithin84:Nithin@cluster0.wob2cfi.mongodb.net/coded"

app.config['MONGO_URI'] = os.environ.get('url')
app.config['SECRET_KEY'] = token_urlsafe(32)

mongo = PyMongo(app)
coded = mongo.db.coded  # Use 'coded' collection as specified



def curr_date():
    """Get current date and time in IST"""
    date = datetime.now(timezone("Asia/Kolkata")).strftime('%Y-%m-%d %H:%M:%S')
    return str(date)

def hash_password(password):
    """Hash password for better security"""
    return hashlib.sha256(password.encode()).hexdigest()

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def send_feedback_email(form_data):
    """Send feedback email with proper error handling"""
    try:
        # Use a more reliable SMTP configuration
        smtp_server = 'smtp.gmail.com'
        smtp_port = 587
        sender_email = "84msnithin@gmail.com"
        sender_password = "hyjy rgfb vctd plub" # Get from environment variable
        
        # Verify credentials are available
        if not sender_email or not sender_password:
            return False, "Email service configuration error. Please contact support."
        
        # Create message
        msg = email.mime.multipart.MIMEMultipart('alternative')
        msg['From'] = sender_email
        msg['To'] = sender_email
        msg['Subject'] = f'CodedPad Feedback from {form_data["name"]}'
        
        # Create HTML and text versions
        text_body = f"""
        New Feedback Received from CodedPad:
        
        Name: {form_data['name']}
        Email: {form_data['email']}
        
        Message:
        {form_data['feedback']}
        
        Timestamp: {curr_date()}
        IP Address: {request.environ.get('REMOTE_ADDR', 'Unknown')}
        User Agent: {request.environ.get('HTTP_USER_AGENT', 'Unknown')}
        """
        
        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #6366f1; border-bottom: 2px solid #6366f1; padding-bottom: 10px;">
                    🎯 New CodedPad Feedback
                </h2>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin: 0 0 10px 0; color: #495057;">Contact Information</h3>
                    <p><strong>Name:</strong> {form_data['name']}</p>
                    <p><strong>Email:</strong> <a href="mailto:{form_data['email']}">{form_data['email']}</a></p>
                </div>
                
                <div style="background: #fff; padding: 15px; border-left: 4px solid #6366f1; margin: 20px 0;">
                    <h3 style="margin: 0 0 10px 0; color: #495057;">Feedback Message</h3>
                    <p style="white-space: pre-wrap;">{form_data['feedback']}</p>
                </div>
                
                <div style="background: #e9ecef; padding: 10px; border-radius: 5px; font-size: 0.9em; color: #6c757d;">
                    <p><strong>Submitted:</strong> {curr_date()}</p>
                    <p><strong>IP:</strong> {request.environ.get('REMOTE_ADDR', 'Unknown')}</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Attach both versions
        text_part = email.mime.text.MIMEText(text_body, 'plain', 'utf-8')
        html_part = email.mime.text.MIMEText(html_body, 'html', 'utf-8')
        
        msg.attach(text_part)
        msg.attach(html_part)
        
        # Send email with better error handling
        server = smtplib.SMTP(smtp_server, smtp_port, timeout=10)
        server.set_debuglevel(0)  # Set to 1 for debugging
        server.starttls()
        server.login(sender_email, sender_password)
        
        # Send to admin
        server.sendmail(sender_email, sender_email, msg.as_string())
        
        # Send confirmation to user
        confirmation_msg = email.mime.multipart.MIMEMultipart('alternative')
        confirmation_msg['From'] = sender_email
        confirmation_msg['To'] = form_data['email']
        confirmation_msg['Subject'] = '✅ Thank you for your CodedPad feedback!'
        
        confirmation_text = f"""
        Dear {form_data['name']},
        
        Thank you for your valuable feedback on CodedPad!
        
        We have received your message and will review it carefully. Your input helps us improve the platform for everyone.
        
        If you have any urgent concerns, please feel free to contact us directly.
        
        Best regards,
        The CodedPad Team
        
        ---
        This is an automated message. Please do not reply to this email.
        Sent on: {curr_date()}
        """
        
        confirmation_html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 15px;">
                <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #6366f1; margin: 0;">✅ Thank You!</h1>
                        <p style="color: #666; margin: 10px 0 0 0;">Your feedback has been received</p>
                    </div>
                    
                    <p>Dear <strong>{form_data['name']}</strong>,</p>
                    
                    <p>Thank you for taking the time to share your feedback on <strong>CodedPad</strong>! 🎉</p>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6366f1;">
                        <p style="margin: 0;"><strong>What happens next?</strong></p>
                        <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                            <li>Our team will review your feedback within 24-48 hours</li>
                            <li>We'll consider your suggestions for future updates</li>
                            <li>If needed, we may reach out for clarification</li>
                        </ul>
                    </div>
                    
                    <p>Your input is invaluable in helping us create a better, more secure note-taking experience for everyone.</p>
                    
                    <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0; font-size: 0.9em; color: #1976d2;">
                            💡 <strong>Tip:</strong> Keep using CodedPad for all your secure note-taking needs. Your privacy and security remain our top priorities!
                        </p>
                    </div>
                    
                    <p>Best regards,<br>
                    <strong>The CodedPad Team</strong> 🛡️</p>
                    
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    <p style="font-size: 0.8em; color: #999; text-align: center;">
                        This is an automated message. Please do not reply to this email.<br>
                        Sent on: {curr_date()}
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        
        conf_text_part = email.mime.text.MIMEText(confirmation_text, 'plain', 'utf-8')
        conf_html_part = email.mime.text.MIMEText(confirmation_html, 'html', 'utf-8')
        
        confirmation_msg.attach(conf_text_part)
        confirmation_msg.attach(conf_html_part)
        
        server.sendmail(sender_email, form_data['email'], confirmation_msg.as_string())
        server.quit()
        
        return True, f"Thank you {form_data['name']}! Your feedback has been sent successfully. Check your email for confirmation."
        
    except smtplib.SMTPAuthenticationError:
        print("SMTP Authentication failed - check email credentials")
        return False, "Email service authentication failed. Your feedback has been saved and we'll respond soon."
    except smtplib.SMTPRecipientsRefused:
        print("SMTP Recipients refused - invalid email address")
        return False, "Invalid email address provided. Please check and try again."
    except smtplib.SMTPServerDisconnected:
        print("SMTP Server disconnected")
        return False, "Email service temporarily unavailable. Please try again in a few minutes."
    except smtplib.SMTPConnectError:
        print("SMTP Connection error")
        return False, "Cannot connect to email service. Your feedback has been saved."
    except (socket.timeout, TimeoutError):
        print("SMTP Timeout error")
        return False, "Email service timeout. Your feedback has been saved and we'll respond soon."
    except Exception as e:
        print(f"Email error: {str(e)}")
        return False, "There was an issue sending your feedback. Your message has been saved and we'll respond soon."

def check_password(password):
    """Check if password exists in database"""
    hashed_password = hash_password(password)
    data = coded.find_one({'password': hashed_password})
    return data if data else False

def check_session_data():
    """Check if session password exists in database"""
    if 'password' not in session:
        return False
    data = coded.find_one({'password': session['password']})
    return data if data else False


@app.route('/')
def home():
    """Main landing page"""
    return render_template("index.html", date=curr_date())

@app.route('/ads.txt')
def ads():
    return send_from_directory("static", "ads.txt")

@app.route("/robots.txt")
def robots_dot_txt():
    return "User-agent: *\nDisallow: /"

@app.route("/api/authenticate", methods=['POST'])
def authenticate():
    """API endpoint for password authentication"""
    try:
        data = request.get_json()
        password = data.get('password', '').strip()
        
        if not password:
            return jsonify({'success': False, 'message': 'Password is required'})
        
        if len(password) < 3:
            return jsonify({'success': False, 'message': 'Password must be at least 3 characters long'})
        
        hashed_password = hash_password(password)
        user_data = coded.find_one({'password': hashed_password})
        
        session['password'] = hashed_password
        session['original_password'] = password
        
        if user_data:
            session['data'] = user_data.get('data', '')
            return jsonify({
                'success': True, 
                'message': 'Authentication successful',
                'data': user_data.get('data', ''),
                'hasData': True
            })
        else:
            session['data'] = ''
            return jsonify({
                'success': True, 
                'message': 'New password - ready to create your first note',
                'data': '',
                'hasData': False
            })
    except Exception as e:
        return jsonify({'success': False, 'message': 'Authentication failed. Please try again.'})

@app.route("/api/save", methods=['POST'])
def save_data():
    """API endpoint to save user data"""
    try:
        if 'password' not in session:
            return jsonify({'success': False, 'message': 'Please authenticate first'})
        
        data = request.get_json()
        user_content = data.get('content', '').strip()
        
        if len(user_content) > 50000:  # Limit content size
            return jsonify({'success': False, 'message': 'Content too large. Maximum 50,000 characters allowed.'})
        
        existing_data = coded.find_one({'password': session['password']})
        
        if existing_data:
            # Update existing record
            coded.update_one(
                {'password': session['password']}, 
                {'$set': {
                    'data': user_content,
                    'last_modified': curr_date()
                }}
            )
            message = 'Your note has been updated successfully!' if user_content != existing_data.get('data', '') else 'No changes made to your note.'
        else:
            # Create new record
            coded.insert_one({
                'password': session['password'],
                'data': user_content,
                'created': curr_date(),
                'last_modified': curr_date()
            })
            message = 'Your note has been saved successfully!'
        
        session['data'] = user_content
        return jsonify({'success': True, 'message': message})
        
    except Exception as e:
        return jsonify({'success': False, 'message': 'Failed to save data. Please try again.'})

@app.route("/api/change-password", methods=['POST'])
def change_password():
    """API endpoint to change user password"""
    try:
        if 'password' not in session:
            return jsonify({'success': False, 'message': 'Please authenticate first'})
        
        data = request.get_json()
        new_password = data.get('newPassword', '').strip()
        
        if not new_password:
            return jsonify({'success': False, 'message': 'New password is required'})
        
        if len(new_password) < 3:
            return jsonify({'success': False, 'message': 'Password must be at least 3 characters long'})
        
        if new_password == session.get('original_password'):
            return jsonify({'success': False, 'message': 'New password must be different from current password'})
        
        new_hashed_password = hash_password(new_password)
        
        # Check if new password already exists
        if coded.find_one({'password': new_hashed_password}):
            return jsonify({'success': False, 'message': 'This password is already in use. Please choose a different one.'})
        
        # Update password in database
        result = coded.update_one(
            {'password': session['password']},
            {'$set': {
                'password': new_hashed_password,
                'last_modified': curr_date()
            }}
        )
        
        if result.modified_count > 0:
            session['password'] = new_hashed_password
            session['original_password'] = new_password
            return jsonify({'success': True, 'message': 'Password changed successfully!'})
        else:
            return jsonify({'success': False, 'message': 'Failed to change password. Please try again.'})
            
    except Exception as e:
        return jsonify({'success': False, 'message': 'Failed to change password. Please try again.'})

@app.route("/api/feedback", methods=['POST'])
def submit_feedback():
    """API endpoint for feedback submission"""
    try:
        data = request.get_json()
        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        feedback = data.get('feedback', '').strip()
        
        # Validation
        if not all([name, email, feedback]):
            return jsonify({'success': False, 'message': 'All fields are required'})
        
        if len(name) < 2:
            return jsonify({'success': False, 'message': 'Name must be at least 2 characters long'})
        
        if not validate_email(email):
            return jsonify({'success': False, 'message': 'Please enter a valid email address'})
        
        if len(feedback) < 10:
            return jsonify({'success': False, 'message': 'Feedback must be at least 10 characters long'})
        
        # Store feedback in database
        feedback_data = {
            'name': name,
            'email': email,
            'feedback': feedback,
            'submitted_at': curr_date()
        }
        
        # Send email
        email_success, email_message = send_feedback_email(feedback_data)
        
        # Always store feedback in database regardless of email success
        try:
            mongo.db.feedback.insert_one(feedback_data)
            db_stored = True
        except Exception as e:
            print(f"Database error: {e}")
            db_stored = False
        
        if email_success:
            return jsonify({'success': True, 'message': email_message})
        elif db_stored:
            return jsonify({'success': True, 'message': f'Thank you {name}! Your feedback has been received and will be reviewed within 24-48 hours.'})
        else:
            return jsonify({'success': False, 'message': 'Failed to submit feedback. Please try again later.'})
            
    except Exception as e:
        return jsonify({'success': False, 'message': 'Failed to submit feedback. Please try again.'})

@app.route("/api/stats")
def get_stats():
    """Get application statistics"""
    try:
        total_notes = coded.count_documents({})
        return jsonify({
            'success': True,
            'stats': {
                'total_notes': total_notes,
                'date': curr_date()
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'message': 'Failed to fetch statistics'})

# Admin API endpoints
@app.route("/api/admin/stats")
def admin_stats():
    """Get admin dashboard statistics"""
    try:
        # Check both collections
        coded_users = coded.count_documents({})
        codedpad_users = mongo.db.codedpad.count_documents({})
        total_users = coded_users + codedpad_users
        
        total_feedback = mongo.db.feedback.count_documents({})
        
        # Count active notes (non-empty data)
        coded_active = coded.count_documents({"data": {"$ne": ""}})
        codedpad_active = mongo.db.codedpad.count_documents({"data": {"$ne": ""}})
        active_notes = coded_active + codedpad_active
        
        return jsonify({
            'success': True,
            'totalUsers': total_users,
            'totalFeedback': total_feedback,
            'activeNotes': active_notes
        })
    except Exception as e:
        print(f"Admin stats error: {e}")
        return jsonify({'success': False, 'message': 'Failed to fetch admin statistics'})

@app.route("/api/admin/users")
def admin_get_users():
    """Get user data for admin dashboard from both collections with pagination.

    Query params:
    - limit: number of users to return (default 50 for first load, 10 for load-more)
    - cursor: last seen user's _id string; when provided, returns users with _id < cursor
    """
    try:
        # Read pagination params
        limit = int(request.args.get('limit', 50))
        cursor = request.args.get('cursor')

        # Build filter for pagination using ObjectId time ordering
        query_filter = {}
        if cursor:
            try:
                query_filter = {"_id": {"$lt": ObjectId(cursor)}}
            except Exception:
                query_filter = {}

        # Get more users from both collections to ensure proper merge ordering
        # Fetch multiplier ensures enough docs from each collection before merge
        fetch_multiplier = 3
        fetch_limit = max(limit * fetch_multiplier, limit)
        
        # Get users from 'coded' collection
        coded_users = list(coded.find(query_filter).sort("_id", -1).limit(fetch_limit))
        
        # Get users from 'codedpad' collection
        codedpad_users = list(mongo.db.codedpad.find(query_filter).sort("_id", -1).limit(fetch_limit))
        
        # Format the data for display
        formatted_users = []
        
        # Process 'coded' collection data
        for user in coded_users:
            formatted_users.append({
                '_id': str(user['_id']),
                'password': user.get('password', 'Unknown'),
                'data': user.get('data', ''),
                'collection': 'coded',
                'lastModified': user.get('last_modified', user.get('lastModified', 'Unknown')),
                'created': user['_id'].generation_time.strftime('%Y-%m-%d %H:%M:%S'),
                'sort_key': user['_id'].generation_time  # For proper sorting
            })
        
        # Process 'codedpad' collection data
        for user in codedpad_users:
            formatted_users.append({
                '_id': str(user['_id']),
                'password': user.get('password', 'Unknown'), 
                'data': user.get('data', ''),
                'collection': 'codedpad',
                'lastModified': user.get('last_modified', user.get('lastModified', 'Unknown')),
                'created': user['_id'].generation_time.strftime('%Y-%m-%d %H:%M:%S'),
                'sort_key': user['_id'].generation_time  # For proper sorting
            })
        
        # Sort all users by creation time (most recent first) and limit to requested size
        formatted_users.sort(key=lambda x: x['sort_key'], reverse=True)
        formatted_users = formatted_users[:limit]
        
        # Remove sort_key from final output
        for user in formatted_users:
            del user['sort_key']
        
        # Prepare next cursor for pagination (oldest _id in this page)
        next_cursor = None
        if formatted_users:
            # The last item in this page is the oldest; use its _id as next cursor
            next_cursor = formatted_users[-1]['_id']
        
        print(f"Returning {len(formatted_users)} users (limit={limit})")
        
        return jsonify({
            'success': True,
            'users': formatted_users,
            'total_shown': len(formatted_users),
            'nextCursor': next_cursor
        })
    except Exception as e:
        print(f"Admin get users error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'message': f'Failed to fetch user data: {str(e)}'})

@app.route("/api/admin/users/<user_id>", methods=['DELETE'])
def admin_delete_user(user_id):
    """Delete a specific user from both collections"""
    try:
        # Try to delete from 'coded' collection first
        result_coded = coded.delete_one({"_id": ObjectId(user_id)})
        
        # Try to delete from 'codedpad' collection
        result_codedpad = mongo.db.codedpad.delete_one({"_id": ObjectId(user_id)})
        
        if result_coded.deleted_count > 0 or result_codedpad.deleted_count > 0:
            collection = 'coded' if result_coded.deleted_count > 0 else 'codedpad'
            return jsonify({'success': True, 'message': f'User deleted successfully from {collection} collection'})
        else:
            return jsonify({'success': False, 'message': 'User not found in any collection'})
    except Exception as e:
        print(f"Admin delete user error: {e}")
        return jsonify({'success': False, 'message': 'Failed to delete user'})

@app.route("/api/admin/users/all", methods=['DELETE'])
def admin_delete_all_users():
    """Delete all users from both collections - DANGEROUS OPERATION"""
    try:
        result_coded = coded.delete_many({})
        result_codedpad = mongo.db.codedpad.delete_many({})
        total_deleted = result_coded.deleted_count + result_codedpad.deleted_count
        
        return jsonify({
            'success': True, 
            'message': f'Deleted {total_deleted} users successfully (coded: {result_coded.deleted_count}, codedpad: {result_codedpad.deleted_count})'
        })
    except Exception as e:
        print(f"Admin delete all users error: {e}")
        return jsonify({'success': False, 'message': 'Failed to delete all users'})

@app.route("/api/admin/feedback")
def admin_get_feedback():
    """Get recent 50 feedback entries for admin dashboard"""
    try:
        # Get only the most recent 50 feedback entries for performance
        feedback_list = list(mongo.db.feedback.find({}).sort("_id", -1).limit(50))
        
        # Format the data for display
        formatted_feedback = []
        for feedback in feedback_list:
            formatted_feedback.append({
                '_id': str(feedback['_id']),
                'name': feedback.get('name', 'Unknown'),
                'email': feedback.get('email', 'Unknown'),
                'feedback': feedback.get('feedback', ''),
                'submitted_at': feedback.get('submitted_at', curr_date())
            })
        
        print(f"Returning {len(formatted_feedback)} most recent feedback entries")
        
        return jsonify({
            'success': True,
            'feedback': formatted_feedback,
            'total_shown': len(formatted_feedback)
        })
    except Exception as e:
        print(f"Admin get feedback error: {e}")
        return jsonify({'success': False, 'message': 'Failed to fetch feedback data'})

@app.route("/api/admin/feedback/<feedback_id>", methods=['DELETE'])
def admin_delete_feedback(feedback_id):
    """Delete a specific feedback"""
    try:
        result = mongo.db.feedback.delete_one({"_id": ObjectId(feedback_id)})
        
        if result.deleted_count > 0:
            return jsonify({'success': True, 'message': 'Feedback deleted successfully'})
        else:
            return jsonify({'success': False, 'message': 'Feedback not found'})
    except Exception as e:
        return jsonify({'success': False, 'message': 'Failed to delete feedback'})

@app.errorhandler(404)
def not_found(error):
    return render_template('index.html'), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'success': False, 'message': 'Internal server error. Please try again later.'}), 500

@app.errorhandler(Exception)
def handle_exception(e):
    return jsonify({'success': False, 'message': 'An unexpected error occurred. Please try again.'}), 500


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8080, debug=True)
    
