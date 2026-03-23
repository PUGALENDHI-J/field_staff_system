import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'package:geolocator/geolocator.dart';

class TaskScreen extends StatefulWidget {
  @override
  _TaskScreenState createState() => _TaskScreenState();
}

class _TaskScreenState extends State<TaskScreen> {
  List<dynamic> _tasks = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetchTasks();
  }

  void _fetchTasks() async {
    final tasks = await ApiService.getTasks();
    setState(() {
      _tasks = tasks;
      _loading = false;
    });
  }

  void _updateTaskStatus(String taskId, String currentStatus) {
    showModalBottomSheet(
      context: context,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (context) {
        String _newStatus = currentStatus;
        TextEditingController _notesController = TextEditingController();

        return Padding(
          padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom, left: 24, right: 24, top: 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Update Task', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: _newStatus,
                decoration: InputDecoration(
                  labelText: 'Status',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
                items: ['Pending', 'In Progress', 'Completed']
                    .map((s) => DropdownMenuItem(value: s, child: Text(s)))
                    .toList(),
                onChanged: (val) {
                  if (val != null) setState(() => _newStatus = val);
                },
              ),
              SizedBox(height: 16),
              TextField(
                controller: _notesController,
                maxLines: 3,
                decoration: InputDecoration(
                  labelText: 'Add Notes',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blue[600],
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onPressed: () async {
                    Navigator.pop(context);
                    setState(() => _loading = true);
                    
                    Position pos = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high);
                    bool success = await ApiService.updateTask(
                      taskId, 
                      _newStatus, 
                      _notesController.text, 
                      pos.latitude, 
                      pos.longitude,
                    );

                    if (success) {
                      _fetchTasks();
                    } else {
                      setState(() => _loading = false);
                      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to update task')));
                    }
                  },
                  child: Text('Submit Update', style: TextStyle(color: Colors.white, fontSize: 16)),
                ),
              ),
              SizedBox(height: 24),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('My Tasks', style: TextStyle(color: Colors.black87, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: IconThemeData(color: Colors.black87),
      ),
      body: _loading 
          ? Center(child: CircularProgressIndicator())
          : _tasks.isEmpty
              ? Center(child: Text('No tasks assigned', style: TextStyle(color: Colors.grey)))
              : ListView.builder(
                  padding: EdgeInsets.all(16),
                  itemCount: _tasks.length,
                  itemBuilder: (context, index) {
                    final task = _tasks[index];
                    return Card(
                      margin: EdgeInsets.only(bottom: 16),
                      elevation: 2,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      child: Padding(
                        padding: EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  task['clientName'],
                                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                                ),
                                Container(
                                  padding: EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: task['status'] == 'Completed' 
                                        ? Colors.green[50] 
                                        : task['status'] == 'In Progress' 
                                            ? Colors.blue[50] 
                                            : Colors.orange[50],
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: Text(
                                    task['status'],
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                      color: task['status'] == 'Completed' 
                                          ? Colors.green[700] 
                                          : task['status'] == 'In Progress' 
                                              ? Colors.blue[700] 
                                              : Colors.orange[700],
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            SizedBox(height: 8),
                            Row(
                              children: [
                                Icon(Icons.calendar_today, size: 14, color: Colors.grey[500]),
                                SizedBox(width: 6),
                                Text(task['date'].toString().split('T')[0], style: TextStyle(color: Colors.grey[600])),
                              ],
                            ),
                            if (task['notes'] != null && task['notes'].isNotEmpty) ...[
                              SizedBox(height: 12),
                              Container(
                                padding: EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: Colors.grey[50],
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Icon(Icons.notes, size: 16, color: Colors.grey[500]),
                                    SizedBox(width: 8),
                                    Expanded(child: Text(task['notes'], style: TextStyle(color: Colors.grey[700], fontSize: 13))),
                                  ],
                                ),
                              ),
                            ],
                            SizedBox(height: 16),
                            Divider(),
                            SizedBox(height: 8),
                            SizedBox(
                              width: double.infinity,
                              child: OutlinedButton.icon(
                                icon: Icon(Icons.edit, size: 16),
                                label: Text('Update Status'),
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: Colors.blue[600],
                                  side: BorderSide(color: Colors.blue[600]!),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                ),
                                onPressed: () => _updateTaskStatus(task['_id'], task['status']),
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}
