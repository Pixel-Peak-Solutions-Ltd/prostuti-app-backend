# API Documentation

## Course Management Permissions

### Overview
To enhance security and role-based access control, specific permissions are now required for teachers to access course management features. The `Course` permission must be assigned to a teacher's profile for them to view, create, update, or delete courses. Admins retain full access and bypass these checks.

### Teacher Access
- **Role**: `teacher`
- **Required Permission**: `ASSIGNED_WORKS.Course` ('Course')

### Affected Endpoints

#### 1. Create Course
- **Endpoint**: `POST /api/v1/courses/`
- **Access**: `Teacher` (with 'Course' permission)
- **Description**: Creates a new course.

#### 2. Get My Courses
- **Endpoint**: `GET /api/v1/courses/course-by-me`
- **Access**: `Teacher` (with 'Course' permission)
- **Description**: Retrieves courses created by the authenticated teacher.

#### 3. Update Course
- **Endpoint**: `PATCH /api/v1/courses/:courseId`
- **Access**: `Teacher` (with 'Course' permission) OR `Admin`
- **Description**: Updates an existing course.

#### 4. Delete Course
- **Endpoint**: `DELETE /api/v1/courses/:courseId`
- **Access**: `Teacher` (with 'Course' permission) OR `Admin`
- **Description**: Deletes a course.

### Error Responses
- **403 Forbidden**: Returned if a teacher attempts to access these endpoints without the 'Course' permission in their `assignedWorks`.
  ```json
  {
    "success": false,
    "message": "You do not have permission to access Course related features.",
    "errorMessages": [ ... ],
    "stack": ...
  }
  ```
