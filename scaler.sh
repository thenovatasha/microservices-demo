#!/bin/bash

# Usage: ./scale.sh <number-of-replicas>

if [ $# -ne 1 ]; then
  echo "Usage: $0 <replica-count>"
  exit 1
fi

REPLICA_COUNT=$1

DEPLOYMENTS=(
  emailservice
  checkoutservice
  recommendationservice
  frontend
  paymentservice
  productcatalogservice
  cartservice
  currencyservice
  shippingservice
  adservice
)

NAMESPACE=default
for deployment in "${DEPLOYMENTS[@]}"; do
  echo "Scaling $deployment to $REPLICA_COUNT replicas..."
  kubectl scale deployment "$deployment" --replicas="$REPLICA_COUNT" -n $NAMESPACE
done

echo "Scaling completed."
