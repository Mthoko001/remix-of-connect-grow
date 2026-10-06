# GrowMeOnline

### Discover trusted local businesses. Turn enquiries into opportunities.

GrowMeOnline is a local business marketplace that helps customers find service providers and gives suppliers a place to showcase their business and manage customer enquiries. A dedicated administration portal supports supplier verification, lead review, and marketplace operations.

Built for customers, suppliers, and marketplace administrators, GrowMeOnline brings discovery, trust, and lead management into one platform.

![React 19](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![TanStack Start](https://img.shields.io/badge/TanStack_Start-SSR-FF4154?logo=reactquery&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Database%20%7C%20Auth%20%7C%20Storage-3FCF8E?logo=supabase&logoColor=white)

## What you can do

### Find a service

- Browse local supplier listings and categories.
- Explore supplier profiles and business details.
- Send an enquiry directly from a supplier profile.
- Get a confirmation while the enquiry is reviewed.

### Grow a business

- Create and maintain a supplier profile.
- Submit the business for verification and track its review status.
- Receive and manage qualified customer enquiries.
- Monitor profile views, lead activity, and subscription status.
- Choose a subscription package to continue receiving leads after the free allowance.

### Run the marketplace

- Review and verify supplier profiles.
- Qualify or reject enquiries before suppliers receive them.
- Manage categories, subscription packages, and subscriptions.
- View marketplace activity and administrative audit information.

## How it works

1. **Suppliers create a profile** and submit it for review. Approved profiles are listed in the marketplace.
2. **Customers browse and enquire** about a supplier's services.
3. **An administrator reviews each enquiry.** Only qualified enquiries are shared with the supplier; rejected enquiries do not count toward the lead allowance.
4. **Suppliers manage qualified leads** in their portal. The first five qualified leads are free; an active subscription is required for continued lead intake after that.

Subscription payments are handled through Yoco. A subscription is activated only after the server verifies Yoco's webhook confirmation. Chatwoot lead forwarding and transactional email are best-effort integrations and do not replace the application's enquiry records.

## Technology

- **Application:** React 19, TypeScript, TanStack Start, TanStack Router
- **UI:** Tailwind CSS 4, Radix UI
- **Data and authentication:** Supabase Postgres, Auth, and Storage
- **Forms and validation:** React Hook Form, Zod
- **Payments:** Yoco
- **Optional integrations:** Chatwoot, Lovable AI Gateway
- **Build tooling:** Vite

## Getting started

### Prerequisites

- Node.js (current LTS recommended)
- npm
- A Supabase project configured for this application

### Install dependencies

```sh
git clone https://github.com/Mthoko001/remix-of-connect-grow.git
cd remix-of-connect-grow
npm ci
```

### Configure Supabase

Create a local `.env` file in the project root and set the Supabase project URL and publishable key:

```dotenv
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

The non-prefixed variables are used by server-side integrations. The `VITE_` variables are available to the browser; use only the Supabase publishable key there. Apply the SQL migrations in `drizzle/migrations/` to your Supabase database in numeric order, and configure the required Supabase Auth, Row Level Security, and Storage policies for your deployment.

### Optional server-side integrations

Set these only when enabling the corresponding features:

| Variables | Purpose |
| --- | --- |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side operations that require elevated Supabase access |
| `LOVABLE_API_KEY` | AI-assisted supplier business-description suggestions |
| `CHATWOOT_URL`, `CHATWOOT_ACCOUNT_ID`, `CHATWOOT_API_TOKEN` | Forwarding leads to a configured Chatwoot inbox |
| `YOCO_SECRET_KEY`, `YOCO_WEBHOOK_SECRET` | Yoco checkout creation and webhook verification |

Keep service-role keys, payment secrets, webhook secrets, and API tokens on the server. Never add secrets to a `VITE_` variable or commit them to source control.

### Start the development server

```sh
npm run dev
```

Vite prints the local URL when the server is ready.

## Common commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Create a production build |
| `npm run build:dev` | Create a development-mode build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Main application areas

| Area | Routes |
| --- | --- |
| Marketplace | `/`, `/suppliers`, `/suppliers/$slug`, `/pricing` |
| Customer account | `/login`, `/forgot-password`, `/reset-password` |
| Supplier portal | `/supplier/signup`, `/supplier/dashboard`, `/supplier/profile`, `/supplier/enquiries`, `/supplier/subscription`, `/supplier/settings` |
| Administration | `/admin/login`, `/admin/dashboard`, `/admin/suppliers`, `/admin/categories`, `/admin/packages`, `/admin/enquiries`, `/admin/subscriptions` |

Routes are defined by files in `src/routes/`. The generated route tree is `src/routeTree.gen.ts`; do not edit it by hand.

## Project structure

```text
├── public/                    # Static assets
├── src/
│   ├── components/            # Shared, customer, supplier, and admin UI
│   ├── hooks/                 # Shared React hooks
│   ├── integrations/supabase/ # Supabase clients, auth, and generated types
│   ├── lib/                   # Application services and business logic
│   ├── routes/                # TanStack Start file-based routes
│   ├── routeTree.gen.ts       # Generated route tree
│   └── styles.css             # Global styles
├── drizzle/
│   ├── migrations/            # SQL database migrations
│   └── schema.ts              # Drizzle schema
├── supabase/                  # Supabase project configuration
└── package.json
```

## Data, privacy, and integrations

The database is the authority for access control and lead eligibility. Configure Supabase Row Level Security and Storage policies for your environment; client-side checks are not a substitute for database authorization. The free-lead allowance is enforced in the database.

Enquiries are stored before optional integrations run. Email delivery and Chatwoot forwarding are best-effort, so an integration outage should not prevent an enquiry from being recorded. Yoco payment success is confirmed server-side through a signature-verified webhook rather than trusted from the browser.

## Contributing

1. Create a focused feature branch.
2. Make the change and verify it locally.
3. Run `npm run lint` and `npm run build` when appropriate.
4. Open a pull request describing the change and any required database or deployment configuration.
