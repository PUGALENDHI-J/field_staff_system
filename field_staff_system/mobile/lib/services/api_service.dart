import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';

class ApiService {
  static const String baseUrl = 'http://localhost:5000/api/v1';

  // Login
  static Future<User?> login(String phone, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'phone': phone, 'password': password}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final user = User.fromJson(data);
        
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', user.token);
        await prefs.setString('userData', jsonEncode(data));
        
        return user;
      }
      return null;
    } catch (e) {
      print('Login Error: $e');
      return null;
    }
  }

  // Get token helper
  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  // Fetch Tasks
  static Future<List<dynamic>> getTasks() async {
    try {
      final token = await getToken();
      final response = await http.get(
        Uri.parse('$baseUrl/tasks'),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return [];
    } catch (e) {
      print('Fetch Tasks Error: $e');
      return [];
    }
  }

  // Update Task
  static Future<bool> updateTask(String taskId, String status, String notes, double lat, double lng) async {
    try {
      final token = await getToken();
      final response = await http.put(
        Uri.parse('$baseUrl/tasks/$taskId'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json'
        },
        body: jsonEncode({
          'status': status,
          'notes': notes,
          'location': {'lat': lat, 'lng': lng}
        }),
      );

      return response.statusCode == 200;
    } catch (e) {
      print('Update Task Error: $e');
      return false;
    }
  }

  // Mark Attendance
  static Future<bool> markAttendance(double lat, double lng, String status) async {
    try {
      final token = await getToken();
      final date = DateTime.now().toIso8601String();
      
      final response = await http.post(
        Uri.parse('$baseUrl/attendance'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json'
        },
        body: jsonEncode({
          'date': date,
          'status': status,
          'location': {'lat': lat, 'lng': lng}
        }),
      );

      return response.statusCode == 201;
    } catch (e) {
      print('Mark Attendance Error: $e');
      return false;
    }
  }
}
