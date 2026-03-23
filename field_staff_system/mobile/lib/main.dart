import 'package:flutter/material.dart';
import 'screens/login_screen.dart';

void main() {
  runApp(FieldStaffApp());
}

class FieldStaffApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Field Staff App',
      theme: ThemeData(
        fontFamily: 'Inter',
        primarySwatch: Colors.blue,
        scaffoldBackgroundColor: Colors.grey[50],
      ),
      home: LoginScreen(),
      debugShowCheckedModeBanner: false,
    );
  }
}
