class User {
  final String id;
  final String name;
  final String phone;
  final String role;
  final String token;

  User({
    required this.id,
    required this.name,
    required this.phone,
    required this.role,
    required this.token,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['_id'] ?? '',
      name: json['name'] ?? '',
      phone: json['phone'] ?? '',
      role: json['role'] ?? '',
      token: json['token'] ?? '',
    );
  }
}
