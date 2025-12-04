import type { Collection, Document } from '@/types';

export const documents: Document[] = [
  {
    id: 'doc-1',
    name: 'Project Phoenix - Q3 Report.pdf',
    content: `
Project Phoenix: Q3 2024 Financial Report

Summary:
This quarter has shown remarkable growth, with a 20% increase in revenue compared to Q2. The primary driver for this growth was the successful launch of our new "Nova" feature set, which attracted a significant number of enterprise clients. Our net profit margin stands at 15%, exceeding our forecast of 12%.

Key Highlights:
- Revenue: $2.4M (up 20% QoQ)
- New Enterprise Clients: 45
- Customer Acquisition Cost (CAC): $5,200 (down 10% QoQ)
- Lifetime Value (LTV): $25,000

Challenges:
We experienced minor technical debt in the legacy "Orion" module, leading to a 5% increase in support tickets. A refactoring plan is in place for Q4.

Outlook:
We are projecting a 25% revenue growth for Q4, driven by international expansion and the upcoming "Nova Plus" release. The team is confident in meeting these targets.
`,
    collectionId: 'col-1',
    type: 'PDF',
    size: 276480, // 270 KB
    added: '2022-10-15T10:00:00Z',
  },
  {
    id: 'doc-2',
    name: 'Market_Analysis_AI_Trends_2024.pdf',
    content: `
AI Trends Market Analysis - 2024

Executive Summary:
The AI market is projected to reach $1.5 trillion by 2027. Key growth areas include generative AI, ethical AI frameworks, and AI-powered automation. The competitive landscape is intensifying, with both established tech giants and agile startups vying for market share.

Generative AI:
The demand for sophisticated large language models (LLMs) is at an all-time high. Applications span from content creation to complex problem-solving in scientific research. Companies that can provide customized, fine-tuned models will have a significant competitive advantage. This is a very important point for our strategy.

Ethical AI:
As AI becomes more integrated into society, the need for transparent, fair, and accountable AI systems is paramount. Regulatory bodies are beginning to draft legislation, and companies must prioritize ethical considerations in their development lifecycle to build trust and avoid legal repercussions.

Conclusion:
The future belongs to companies that can innovate rapidly while maintaining a strong ethical posture. Strategic partnerships and a focus on specialized, high-value AI applications will be crucial for long-term success.
`,
    collectionId: 'col-1',
    type: 'PDF',
    size: 512000, // 500 KB
    added: '2023-01-20T14:30:00Z',
  },
  {
    id: 'doc-3',
    name: 'Competitor_Profile_InnovateCorp.txt',
    content: `
Competitor Profile: InnovateCorp

Founded: 2020
CEO: Jane Smith
HQ: San Francisco, CA

Strengths:
- Strong R&D department with several patents in machine learning.
- Agile development process allows for rapid product iteration.
- Highly-rated user interface and customer experience.

Weaknesses:
- Limited international presence.
- Higher price point compared to competitors.
- Smaller sales team, leading to slower enterprise sales cycles.

Recent Moves:
InnovateCorp recently acquired "DataWeave," a data analytics startup, signaling a move towards a more comprehensive data intelligence platform. Their latest funding round raised $50M, which will likely be invested in marketing and sales expansion. Their focus is clearly on capturing the mid-market segment.
`,
    collectionId: 'col-2',
    type: 'TXT',
    size: 51200, // 50 KB
    added: '2021-11-30T09:00:00Z'
  },
  {
    id: 'doc-4',
    name: 'Technical_Spec_Nova_Feature.txt',
    content: `
Technical Specification: "Nova" Feature Set

Architecture: Microservices
Primary Language: Go
Database: PostgreSQL with TimescaleDB for time-series data.
Frontend: React with Next.js

Core Components:
1.  Ingestion Service: A scalable service for processing and indexing unstructured data from various sources. Utilizes a message queue (RabbitMQ) for resilience.
2.  Query Engine: A custom-built search and aggregation engine powered by a fine-tuned embedding model. It is designed for low-latency queries over massive datasets.
3.  API Gateway: A GraphQL endpoint that provides a unified interface for all frontend clients.

Security:
All services are containerized using Docker and orchestrated with Kubernetes. We enforce end-to-end encryption and follow the principle of least privilege for all service-to-service communication.
`,
    collectionId: null,
    type: 'TXT',
    size: 25600, // 25 KB
    added: '2023-05-10T18:00:00Z',
  },
  {
    id: 'doc-5',
    name: 'Q1 2023 Financials.xlsx',
    content: 'Spreadsheet content for Q1 2023 financials.',
    collectionId: 'col-1',
    type: 'XLSX',
    size: 256000, // 250KB
    added: '2023-04-12T11:00:00Z'
  },
  {
    id: 'doc-6',
    name: 'Q2 2023 Financials.xlsx',
    content: 'Spreadsheet content for Q2 2023 financials.',
    collectionId: 'col-1',
    type: 'XLSX',
    size: 266240, // 260KB
    added: '2023-07-15T11:00:00Z'
  }
];

export const collections: Collection[] = [
  {
    id: 'col-1',
    name: 'Q3 Business Review',
    documentIds: ['doc-1', 'doc-2', 'doc-5', 'doc-6'],
  },
  {
    id: 'col-2',
    name: 'Competitive Intel',
    documentIds: ['doc-3'],
  },
];
