####################################################################################################
require("ggplot2")
require("dplyr")
require("gridExtra")
require("pander")
require("irr")
require("effsize")
####################################################################################################

# Change this line to your own path successorships path
# setwd('/Users/Arthur/Workspace/successorships')

serverRecovery <- read.csv(file="./shippy-measurement/output/serverRecovery.csv", head=TRUE, sep=",")
clientWelcome <- read.csv(file="./shippy-measurement/output/clientWelcome.csv", head=TRUE, sep=",")
messageRTT <- read.csv(file="./shippy-measurement/output/messageRTT.csv", head=TRUE, sep=",")

mean(serverRecovery$time)


p <- ggplot(serverRecovery, aes(time)) + stat_ecdf(geom = "step")
p <- p + labs(x = 'Server recovery time (s)')
p <- p + labs(y = 'cdf')
p

pdf("./shippy-measurement/graphs/serverRecovery.pdf")
print(p)
dev.off()

p <- ggplot(clientWelcome, aes(time)) + stat_ecdf(geom = "step")
p <- p + labs(x = 'Welcome time (s)')
p <- p + labs(y = 'cdf')
p

pdf("./shippy-measurement/graphs/clientWelcome.pdf")
print(p)
dev.off()

p <- ggplot(messageRTT, aes(time)) + stat_ecdf(geom = "step")
p <- p + labs(x = 'Messages RTT (s)')
p <- p + labs(y = 'cdf')
p

pdf("./shippy-measurement/graphs/messageRTT.pdf")
print(p)
dev.off()