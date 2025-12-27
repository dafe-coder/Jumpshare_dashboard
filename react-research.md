# Frontend Technologies and Architecture Research

## Executive Summary

This research analyzes technologies and architectural approaches used by major companies (Twitch, Twitter, Notion, Dropbox, Asana, Uber, Airbnb, Shopify, Loom) for frontend application development. Special attention is given to Loom analysis, as the project is similar to it.

**Key Findings:**

- All companies use **React + TypeScript** as the foundation
- For state management: **Redux** (majority) or **React Context API** (Notion, Loom)
- For server communication: **GraphQL** (primary) + **REST API** (specific cases)
- For project structure: **Feature-Sliced Design (FSD)** is recommended for new scalable projects

---

## 1. Company Technology Overview

| Company     | Frontend                        | State Management         | API                      | Features                        |
| ----------- | ------------------------------- | ------------------------ | ------------------------ | ------------------------------- |
| **Twitch**  | React, TypeScript               | Redux                    | WebSocket                | Real-time video streaming       |
| **Twitter** | React, TypeScript               | Redux Toolkit            | GraphQL, REST            | High load, real-time            |
| **Notion**  | React, TypeScript               | Context API              | GraphQL, WebSocket       | Large documents, real-time sync |
| **Dropbox** | React, TypeScript               | -                        | REST                     | File operations                 |
| **Asana**   | React, TypeScript               | Redux                    | GraphQL                  | Real-time updates               |
| **Uber**    | React, React Native, TypeScript | -                        | GraphQL, REST, WebSocket | Modular structure, domains      |
| **Airbnb**  | React, TypeScript               | Redux                    | GraphQL                  | Modular structure               |
| **Shopify** | React, TypeScript               | React Query              | GraphQL                  | Feature-based structure         |
| **Loom** ⭐ | React, TypeScript               | Context API, React Query | GraphQL, REST, WebSocket | Video platform                  |

---

## 2. Detailed Loom Analysis (Most Relevant for the Project)

### Technology Stack

- **Frontend:** React + TypeScript
- **State Management:** React Context API + React Query/SWR
- **API:** GraphQL (primary) + REST (for file uploads)
- **Real-time:** WebSocket for status updates and notifications

### Frontend Architecture

**Application Type:**

- React SPA (Single Page Application)
- Possibly Next.js for some pages with SSR

**State Management:**

- **React Context API** — for global state (authentication, user data)
- **React Query/SWR** — for server data and caching
- **Local state** (useState, useReducer) — for components
- Possibly **Zustand** or **Jotai** — for complex state

**API Interaction:**

- **GraphQL** — primary method (type safety, query optimization)
- **REST API** — for file uploads (multipart upload)
- **WebSocket** — for real-time updates (video processing status, notifications)

**Video Handling:**

- Upload: Multipart upload, chunked upload for large files
- Streaming: HLS (HTTP Live Streaming)
- Optimization: Lazy loading, list virtualization

**Monitoring:**

- Error tracking: Sentry, Rollbar
- Performance: Web Vitals, Lighthouse
- Analytics: Mixpanel, Amplitude, Google Analytics

### Project Structure (Feature-Sliced Design)

```
src/
├── app/                    # Application initialization
│   ├── providers/          # Global providers (Theme, Auth, QueryClient)
│   ├── router/             # Routing configuration
│   └── styles/             # Global styles
│
├── pages/                  # Application pages
│   ├── home/
│   ├── video-recorder/
│   ├── video-viewer/
│   ├── library/
│   └── settings/
│
├── widgets/                # Large composite components
│   ├── header/
│   ├── sidebar/
│   ├── video-player/
│   └── video-list/
│
├── features/               # Functional modules
│   ├── video-recording/
│   │   ├── ui/             # UI components
│   │   ├── api/            # API requests
│   │   ├── model/          # Business logic
│   │   └── lib/            # Helper functions
│   ├── video-upload/
│   ├── video-editing/
│   ├── video-sharing/
│   ├── comments/
│   └── notifications/
│
├── entities/               # Business entities
│   ├── user/
│   ├── video/
│   └── comment/
│
└── shared/                 # Reusable modules
    ├── ui/                 # UI components (buttons, inputs)
    ├── lib/                # Utilities
    ├── api/                # Base API clients
    └── types/              # Common types
```

**Organization Principles:**

- Each feature contains everything needed (UI, API, logic)
- Features are isolated and don't depend on each other
- Common components in `shared/ui`, business logic in `entities`
- Easy to add new features without changing existing code

---

## 3. Feature-Sliced Design (FSD) — Project Structure Architecture

### What is it?

FSD is a methodology for organizing frontend code that divides a project into layers by abstraction levels. This provides a clear structure and easy scalability.

### FSD Layers (from top to bottom):

1. **app/** — application initialization, global settings, routing
2. **pages/** — application pages with specific UI
3. **widgets/** — large composite components (combine multiple features)
4. **features/** — individual functional capabilities (add comment, like)
5. **entities/** — business entities (User, Video, Comment)
6. **shared/** — reusable components without business logic

### Import Rules:

- ✅ Can import from lower layers (pages → widgets → features → entities → shared)
- ❌ Cannot import from higher layers
- ✅ Can import from the same layer
- ✅ Shared can be used everywhere

### Why FSD Fits the Project:

**Advantages:**

- ✅ **Scalability** — easy to add new features
- ✅ **Maintainability** — clear structure, easy to find code
- ✅ **Isolation** — features don't affect each other
- ✅ **Reusability** — common components in shared

**Used in Similar Projects:**

- Notion — modular architecture similar to FSD
- Shopify — feature-based structure
- Airbnb — separation into features and shared modules

### When FSD May Not Be the Best Choice:

- ❌ Small projects (excessive structure)
- ❌ Existing large projects (expensive migration)
- ❌ Next.js projects (has its own structure)
- ❌ Teams without experience (requires training)

### FSD Alternatives:

| Approach              | When to Use                 | Examples         |
| --------------------- | --------------------------- | ---------------- |
| **FSD**               | New scalable projects       | Recommended      |
| **Redux + Features**  | Projects with Redux         | Twitter, Airbnb  |
| **Next.js structure** | Next.js projects            | Vercel, startups |
| **Domain-Driven**     | Projects with clear domains | Uber             |
| **Simple structure**  | Small projects, MVP         | Prototypes       |

---

## 4. Final Recommendations for the Project

### Technology Stack:

- **Frontend:** React + TypeScript
- **State Management:** React Context API + React Query/SWR
- **API:** GraphQL (primary) + REST (for file uploads)
- **Real-time:** WebSocket for status updates and notifications
- **Video:** HLS or DASH for adaptive streaming

### Project Structure:

✅ **Use Feature-Sliced Design (FSD)**

**Why:**

- Frontend is being built from scratch — perfect time to implement FSD
- Scalability is needed — FSD solves this problem
- Similar approach used by Notion, Shopify, Airbnb
- Proven methodology for large projects

**What It Will Provide:**

- Easy scalability when adding new features
- Clear structure for the development team
- Feature isolation and component reusability
- Alignment with industry best practices

### Key Practices:

- GraphQL for the main part of API (flexibility, type safety)
- React Query for server state management
- WebSocket for real-time updates
- Optimistic updates for better UX
- Video optimization: lazy loading, list virtualization
- HLS or DASH for adaptive video streaming

---

## Appendix: Common Industry Patterns

### State Management:

1. **Redux/Redux Toolkit** — Twitch, Twitter, Asana, Airbnb (for complex state)
2. **React Context API** — Notion, Loom (for simple global state)
3. **React Query/SWR** — Shopify, Loom (for server state)
4. **Zustand/Jotai** — modern lightweight solutions

### API Interaction:

1. **GraphQL** — Notion, Asana, Uber, Airbnb, Shopify, Loom (primary method)
2. **REST API** — all companies use for specific cases (file uploads)
3. **WebSocket** — for real-time features (Twitch, Notion, Uber, Loom)

### Project Structure:

1. **Feature-Sliced Design (FSD)** — recommended for new scalable projects, not used in old projects as the approach is new (2020). However, it's very similar to what large projects use internally
2. **Feature-based** — used in Notion, Shopify, Airbnb
3. **Domain-driven** — used in Uber (domain separation)
4. **Component-based** — basic approach for all React projects
