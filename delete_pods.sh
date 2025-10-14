kubectl get pods --no-headers=true | grep "^my-app-" | awk '{print $1}' | xargs kubectl delete pod
