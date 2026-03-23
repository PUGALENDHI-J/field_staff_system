import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import '../services/api_service.dart';

class AttendanceScreen extends StatefulWidget {
  @override
  _AttendanceScreenState createState() => _AttendanceScreenState();
}

class _AttendanceScreenState extends State<AttendanceScreen> {
  bool _loading = false;
  String _statusMessage = 'Ready to mark attendance';

  void _markAttendance() async {
    setState(() {
      _loading = true;
      _statusMessage = 'Getting location...';
    });

    try {
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          throw Exception('Location permissions are denied');
        }
      }

      Position position = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high);
      
      setState(() => _statusMessage = 'Submitting attendance...');

      bool success = await ApiService.markAttendance(position.latitude, position.longitude, 'Present');

      if (success) {
        setState(() {
          _statusMessage = 'Attendance marked successfully!';
        });
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Success!'), backgroundColor: Colors.green));
      } else {
        setState(() => _statusMessage = 'Failed to mark attendance or already marked today.');
      }
    } catch (e) {
      setState(() => _statusMessage = 'Error: $e');
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Attendance', style: TextStyle(color: Colors.black87, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: Center(
        child: Padding(
          padding: EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.fingerprint, size: 100, color: Colors.blue[600]),
              SizedBox(height: 32),
              Text(
                _statusMessage,
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 16, color: Colors.grey[700]),
              ),
              SizedBox(height: 48),
              SizedBox(
                width: 200,
                height: 200,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blue[600],
                    shape: CircleBorder(),
                    elevation: 8,
                  ),
                  onPressed: _loading ? null : _markAttendance,
                  child: _loading 
                    ? CircularProgressIndicator(color: Colors.white)
                    : Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.touch_app, size: 48, color: Colors.white),
                          SizedBox(height: 8),
                          Text('MARK IN', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                        ],
                      ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
