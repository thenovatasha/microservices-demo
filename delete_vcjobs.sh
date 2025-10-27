kubectl get vcjob --no-headers | awk '{print $1}' | xargs kubectl delete vcjob

