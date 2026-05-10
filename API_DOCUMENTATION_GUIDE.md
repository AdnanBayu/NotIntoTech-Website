# NotIntoTech API Documentation Guide

This guide provides a comprehensive overview of how the Swagger/OpenAPI documentation was integrated into the NotIntoTech platform. It explains the setup process and provides examples for documenting all types of API endpoints.

## 1. Installation & Core Tools

We installed two essential npm packages to handle API documentation:
- **`swagger-ui-express`**: Generates and serves the interactive user interface (accessible at `/docs#/`).
- **`swagger-jsdoc`**: Parses JavaScript comment blocks (JSDoc format) and compiles them into a JSON specification that `swagger-ui-express` can read.

## 2. Configuration & Initialization

### `src/swagger.js`
We created a configuration file to define the global rules for the API. This file specifies the OpenAPI version (3.0.0), general information about the API, and sets up global components like Security Schemes.

Notably, we defined the **Bearer Auth** mechanism here:
```javascript
components: {
    securitySchemes: {
        bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
        }
    }
}
```

### Server Integration
In both `server-local.js` (for local development) and `api/index.js` (for Vercel deployment), we mounted the Swagger route before the standard API routes:
```javascript
const swaggerSetup = require('./src/swagger');
swaggerSetup(app); // Maps the interactive UI to /docs
```

## 3. How Endpoint Documentation Works

Swagger generates documentation by reading YAML-formatted comments located directly above your API routes. Here is a breakdown of the different features we implemented:

### A. Documenting a Simple GET Request with Query Parameters
For `GET /api/insights-admin/all`, we needed to document pagination and filters. We used the `parameters` field with `in: query`.

```yaml
/**
 * @swagger
 * /api/insights-admin/all:
 *   get:
 *     summary: Retrieve a list of all articles including drafts (Admin only)
 *     tags: [Insights]
 *     parameters:
 *       - in: query               <-- Specifies this is a URL query string
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: A list of articles
 */
```

### B. Documenting Path Parameters (Variables in the URL)
For routes like `DELETE /api/insights/:id`, we need to tell Swagger about the dynamic `id` variable. We use `in: path` for this:

```yaml
/**
 * @swagger
 * /api/insights/{id}:             <-- Notice {id} is used instead of :id
 *   delete:
 *     summary: Delete an article (Admin only)
 *     tags: [Insights]
 *     parameters:
 *       - in: path                <-- Specifies this is part of the URL path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
```

### C. Documenting Request Bodies (POST and PUT)
When sending data to the server (like `POST /api/insights` or `PUT /api/insights/:id`), we define a `requestBody` describing the JSON structure expected:

```yaml
/**
 * @swagger
 * /api/insights:
 *   post:
 *     summary: Create a new article (Admin only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:           <-- Array of required fields
 *               - title
 *               - content
 *             properties:         <-- Define each field here
 *               title:
 *                 type: string
 *               tags:
 *                 type: array     <-- Arrays require 'items' to be defined
 *                 items:
 *                   type: string
 */
```

### D. Securing Endpoints
For routes that use the `isAdmin` middleware, we require a Bearer token. We apply the security schema globally to the specific route:

```yaml
/**
 * @swagger
 * /api/insights:
 *   post:
 *     security:                   <-- Adds a lock icon to the UI
 *       - bearerAuth: []
 */
```

## 4. Checklist for Adding New Endpoints

To document a new route (e.g., in `datasetRouter.js`):
1. **Locate the route**: Find the `router.get(...)` or `router.post(...)` in your code.
2. **Open a comment block**: Right above the route, type `/**` and press enter.
3. **Start with `@swagger`**: Ensure `@swagger` is the first line inside the block.
4. **Define the Path & Method**: e.g., `/api/dataset/upload:` followed by the method indented by 2 spaces `post:`. Remember to change Express's `:id` format to Swagger's `{id}` format.
5. **Assign a Tag**: `tags: [Dataset]` ensures endpoints are grouped beautifully in the UI.
6. **Define Params/Body**: Describe the inputs the route expects.
7. **Define Responses**: Document what HTTP status codes can be returned.
8. **Check the UI**: Refresh `http://localhost:3000/docs#/` to verify your syntax is correct! (YAML is very strict about 2-space indentations).
