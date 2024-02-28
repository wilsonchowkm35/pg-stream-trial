###
# Consideration:
# - Using ECS rather than Lambda to handle the change streaming
# - Adding some filtering logic in the change streaming, e.g. only send the event for tables we configured 
# 
# TBC:
# - What if multiple consumers are subscribe the change stream, will the event be duplicated? or just send once across all consumers?
# 
# Futher thoughts:
# - What's the impact of db cluster after enabling the change streaming?
###

from diagrams import Cluster, Diagram
from diagrams.aws.database import RDS
from diagrams.aws.compute import ECS
from diagrams.aws.integration import Eventbridge
from diagrams.aws.database import Dynamodb

with Diagram("RDS Data Change Stream", show=False):
    # with Cluster("change streaming workers"):
    #     workers = [ECS("worker1"), ECS("worker2")]
    workers = ECS("data stream consumer")
    RDS("institution db") >> workers >> Eventbridge("data change event")
    # Dynamodb("config db") >> workers
    
