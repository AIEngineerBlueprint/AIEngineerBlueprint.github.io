# AI Engineer Learning Path – Static HTML Website Requirements (PRD)

## Vision

Build a world-class **static HTML learning platform** for AI Engineers.
The goal is **learning by building production-grade AI products**, not just consuming tutorials.
I want to host it on github pages like username.github.io.

> Audience:
- Software Engineers
- Platform Engineers
- Full Stack Engineers
- DevOps/SRE
- Engineering Managers transitioning into AI

---
# Core Principles

1. Learn from first principles.
2. Every concept explains *why*, *how*, *internals*, *trade-offs*.
3. Every chapter contains:
   - Learning objectives
   - Theory
   - Architecture
   - Visual diagrams (SVG)
   - Interactive HTML examples
   - Code examples
   - Hands-on labs
   - Common mistakes
   - Production considerations
   - Interview questions
   - References

4. Focus on shipping AI products.

---
# Site Requirements

Static website only.

Allowed:
- HTML
- CSS
- JavaScript
- SVG
- PNG
- Markdown source (optional)

No backend.

Must work offline.

Responsive.

Dark/light mode.

Search.

Progress tracking using LocalStorage.

Bookmarks.

Previous/Next navigation.

Keyboard shortcuts.

Breadcrumbs.

Reading time.

Interactive quizzes.

Expandable diagrams.

Glossary.

---
# Information Architecture

index.html

Modern dashboard with cards.

Sections:

1. AI Foundations
2. Machine Learning
3. Deep Learning
4. Neural Networks
5. Transformers
6. LLM Fundamentals
7. Generative AI
8. Prompt Engineering
9. Embeddings
10. Vector Databases
11. RAG
12. MCP
13. AI Agents
14. Agentic Systems
15. Memory
16. Tool Calling
17. Structured Output
18. Evaluation
19. Guardrails
20. Grounding
21. AI Security
22. Responsible AI
23. AI in SDLC
24. Production AI Systems
25. AWS AI Stack
26. Azure AI Stack
27. Building Products
28. Local AI (Ollama/Kimi)
29. Claude Code
30. GitHub Copilot
31. OpenAI Codex
32. Interview Preparation

Each section contains:

Overview

Learning objectives

Concept map

Architecture

Internals

Hands-on

Mini project

Capstone

Interview questions

References

---
# Deep Coverage Requirements

The generated course should exceed 500+ HTML pages if needed.

Explain in depth:

What is AI?

What is ML?

DL

Neural Networks

Backpropagation

Attention

Transformer

Tokenization

Embeddings

Context Window

Inference

Training

Fine tuning

RLHF

LoRA

MoE

KV Cache

Speculative decoding

Quantization

Function calling

Streaming

Reasoning models

Evaluation

Hallucination

Grounding

Memory

Agent loops

Planning

Reflection

Multi Agent

---
# LLM Internals

Very detailed.

Tokenization pipeline

Embedding layer

Positional encoding

Attention

Multi-head attention

Feed forward

Residual

Layer norm

Decoder stack

Sampling

Temperature

Top-K

Top-P

Inference pipeline

GPU memory

Latency

Optimization

Serving

Distributed inference

Model loading

Context compression

Prompt caching

KV cache

Every topic includes SVG diagrams.

---
# RAG

Chunking

Embedding

Indexing

Hybrid Search

BM25

Vector Search

Metadata filtering

Re-ranking

Evaluation

Production architecture

---
# MCP

Explain protocol.

Architecture.

Transport.

Security.

Server implementation.

Tool implementation.

Examples.

Enterprise governance.

---
# AI Agents

Single agent

Planner

Executor

Reflection

Memory

Tool calling

Long running workflows

Human approval

Observability

Production architecture

---
# Guardrails

Input validation

Output validation

PII

Prompt injection

Jailbreak

Policy engine

Moderation

Safety

Grounding

---
# AI Security

OWASP LLM Top 10

Prompt Injection

Data Leakage

Model Theft

Supply Chain

Model Poisoning

RAG attacks

MCP attacks

Agent attacks

Secrets

Identity

Sandboxing

Enterprise controls

Threat models

---
# Agentic AI

Agentic AI and Workflow examples
Agent to Agent communication
Failure seanrios
Must know facts and where to be carefull

---
# Responsible AI

Bias

Fairness

Privacy

Compliance

Explainability

Human oversight

EU AI Act

Governance

Audit

---
# AI in SDLC

AI Requirements

AI Design Reviews

AI Coding

Testing

Security Reviews

Evaluation

Deployment

Monitoring

Continuous Evaluation

AI-assisted SDLC using GitHub Copilot, Claude Code and Codex.

---
# Building Products

Primary focus.

Teach users to build complete products.

Every product includes:

Requirements

Architecture

API design

Database

Prompt library

Testing

Evaluation

CI/CD

Deployment

Monitoring

Documentation

Release

Cost optimization

Security

Observability

Example products:

Chat platform

Enterprise RAG

AI code reviewer

Document intelligence

AI CRM assistant

AI support bot

AI healthcare demo

AI finance demo

Developer portal

Engineering assistant

Include both AWS and Azure deployment variants.

---
# Cloud

AWS

Bedrock

SageMaker

Lambda

ECS

EKS

OpenSearch

Aurora

S3

CloudWatch

IAM

Azure

Azure OpenAI

AI Foundry

Azure AI Search

AKS

Functions

Blob Storage

Entra ID

Application Insights

Compare AWS vs Azure.

---
# Local AI

Ollama

Kimi

LM Studio

GGUF

Quantization

CPU vs GPU

Model selection

Offline development

---
# AI Coding Assistants

Dedicated onboarding pages.

Claude Code:
Include command reference and workflows based on:
https://code.claude.com/docs/en/commands

GitHub Copilot

OpenAI Codex

Model selection

Prompting

Agent mode

Workspace setup

Best practices

Enterprise usage

---
# Interview Preparation

1000+ interview questions.

Behavioral.

System Design.

Coding.

LLM.

Agents.

RAG.

Security.

Architecture.

Leadership.

Model internals.

Cloud.

Prompt engineering.

Mock interviews.

Evaluation rubric.

---
# UI/UX

Modern dashboard.

Glassmorphism.

Animated SVG.

Command palette.

Instant search.

Collapsible navigation.

Progress indicators.

Interactive diagrams.

Mermaid optional pre-rendered to SVG.

Accessible.

WCAG AA.

Fast loading.

Offline.

---
# Deliverables

Generate:

- Static HTML site
- CSS
- JS
- SVG diagrams
- Assets
- Search index
- Quiz engine
- Progress engine
- Documentation
- README
- Build instructions
- Contribution guide

The generated output must be production quality, educational, internally consistent, technically accurate, and designed for long-term maintainability.
