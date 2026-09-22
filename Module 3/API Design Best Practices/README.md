# LU34 - API Design Best Practices

## Overview

This API exposes a simple in-memory posts collection with a resource-oriented REST-style contract.

## Public API

### List posts

- `GET /posts?page=1&limit=20`
- Response: `200 OK`
- Body:

```json
{
  "data": [
    { "id": 1, "title": "Caching 101", "author": "maya", "likes": 0, "createdAt": 1 }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "pages": 1
  }
}
```

### Get one post

- `GET /posts/:id`
- Response: `200 OK`
- Body:

```json
{
  "data": {
    "id": 1,
    "title": "Caching 101",
    "author": "maya",
    "likes": 0,
    "createdAt": 1
  }
}
```

### Create a post

- `POST /posts`
- Response: `201 Created`
- Body:

```json
{
  "data": {
    "id": 6,
    "title": "Example",
    "author": "alex",
    "likes": 0,
    "createdAt": 6
  }
}
```

### Like a post

- `POST /posts/:id/likes`
- Response: `201 Created`
- Body:

```json
{
  "data": {
    "id": 1,
    "title": "Caching 101",
    "author": "maya",
    "likes": 1,
    "createdAt": 1
  }
}
```

### Internal failure demo

- `GET /explode`
- Response: `500 Internal Server Error`
- Body:

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Something went wrong"
  }
}
```

## Error format

All public errors follow a consistent envelope:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Post not found"
  }
}
```

Validation errors and internal errors use stable error codes such as `VALIDATION_ERROR`, `BAD_REQUEST`, and `INTERNAL_ERROR` without exposing stack traces or implementation details.

## Notes

- The app keeps the in-memory post store.
- Pagination defaults to `page=1` and `limit=20`.
- Server-side limit is capped at `100` to prevent excessive payloads.
- Old verb-based routes such as `/getPosts` and `/createPost` are no longer part of the public contract.
