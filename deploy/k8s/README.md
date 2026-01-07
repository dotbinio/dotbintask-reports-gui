# Kubernetes Deployment

Deploy DotbinTask (API + Frontend) to Kubernetes.

## Quick Start

```bash
# Update kustomization.yaml with your token
kubectl apply -k deploy/k8s
```

## Prerequisites

- Kubernetes cluster (v1.19+)
- kubectl configured
- Ingress controller (nginx recommended)
- Default StorageClass configured for dynamic volume provisioning

## Configuration

### 1. Update Secret Token

Edit `kustomization.yaml`:
```yaml
secretGenerator:
  - name: dotbintask-secret
    literals:
      - tokens=your-actual-token-here
```

### 2. Update Ingress Hostname

Edit `ingress.yaml`:
```yaml
rules:
  - host: tasks.yourdomain.com  # Change this
```

### 3. Configure Storage (Optional)

The deployment uses your cluster's default StorageClass for dynamic volume provisioning. To use a specific StorageClass, edit `persistentvolumeclaim.yaml`:

```yaml
spec:
  storageClassName: your-storage-class-name  # e.g., standard, gp2, nfs-client
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
```

## Deployment

### Using kubectl with kustomize

```bash
# Deploy
kubectl apply -k deploy/k8s

# View resources
kubectl get all -n dotbintask

# View logs
kubectl logs -n dotbintask -l app=dotbintask -c api
kubectl logs -n dotbintask -l app=dotbintask -c frontend

# Delete
kubectl delete -k deploy/k8s
```

## Architecture

```
┌─────────────────┐
│     Ingress     │
│  (tasks.ex.com) │
└────────┬────────┘
         │
    ┌────┴────────────────┐
    │                     │
/api/*              /  (everything else)
    │                     │
    ▼                     ▼
┌────────┐           ┌────────┐
│   API  │           │  GUI   │
│  :8080 │           │  :80   │
└────┬───┘           └────────┘
     │
     ▼
┌─────────────┐
│ PersistentVolume │
│  (Task Data) │
└─────────────┘
```

Both containers run in the same pod, sharing the same network namespace.

## Ingress Routing

- `/api/*` → Backend API (port 8080)
- `/health` → Backend API health check
- `/` → Frontend GUI (port 80)

## Cleanup

```bash
# Delete all resources
kubectl delete -k deploy/k8s

# Or delete namespace (removes everything)
kubectl delete namespace dotbintask
```