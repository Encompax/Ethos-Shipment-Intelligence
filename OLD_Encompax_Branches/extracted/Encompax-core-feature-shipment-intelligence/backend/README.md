# Encompax-core Backend

Shared backend platform for the Encompax ecosystem.

This backend should remain vendor-agnostic at the platform layer and provide:

- integration registry and adapter loading
- normalized metrics storage
- datasource and ingestion services
- shared APIs for downstream products
- tenant-aware configuration and governance

Vendor-specific systems such as Paycom, Dynamics, Velocity, or Ninety.io should
be treated as adapter implementations behind generic business capabilities such
as HRIS, ERP, Quality Management, and Operations System.
