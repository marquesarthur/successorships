####################################################################################################
require("ggplot2")
require("dplyr")
require("gridExtra")
require("pander")
require("irr")
require("effsize")
require("plyr")
require("reshape2")
####################################################################################################

# Change this line to your own path successorships path
# setwd('/Users/Arthur/Workspace/cpsc527-development/measurement/successorships')

serverRecovery <- read.csv(file="./shippy-measurement/output/serverRecovery.csv", head=TRUE, sep=",")
serverRecovery <- filter(serverRecovery, time <= 200)

clientWelcome <- read.csv(file="./shippy-measurement/output/clientWelcome.csv", head=TRUE, sep=",")
summary(clientWelcome$numSuccessors)
sd(clientWelcome$numSuccessors)
clientWelcome$numSuccessors <- as.character(clientWelcome$numSuccessors)

messageRTT <- read.csv(file="./shippy-measurement/output/messageRTT.csv", head=TRUE, sep=",")
messageRTT$numSuccessors <- as.character(messageRTT$numSuccessors)

stateConvergence <- read.csv(file="./shippy-measurement/output/stateConvergence.csv", head=TRUE, sep=",")
stateConvergence$numSuccessors <- as.character(stateConvergence$numSuccessors)
stateConvergence <- filter(stateConvergence, time < 400)


summary(filter(serverRecovery, time <= 200)$time)

sd(filter(serverRecovery, time <= 200)$time)

summary(clientWelcome$time)
sd(clientWelcome$time)


filter(clientWelcome, time > 40)



summary(messageRTT$time)


summary(stateConvergence$time)




# >> Server Recovery Time

p <- ggplot(serverRecovery, aes(time)) + stat_ecdf(geom = "step")
p <- p + labs(x = 'Server recovery time (s)')
p <- p + labs(y = 'cdf')
p <- p + scale_x_continuous(breaks = round(seq(0, max(serverRecovery$time), by = 5), 1))
p <- p + scale_y_continuous(breaks = seq(0, 1, by = 0.1))
p <- p + theme_bw()
p


pdf("/Users/Arthur/Workspace/cpsc527-development/report/successorships/paper/figures/server-recovery.pdf")
print(p)
dev.off()

# >> Client Welcome Time

p <- ggplot(clientWelcome, aes(time)) + stat_ecdf(geom = "step")
p <- p + labs(x = 'Welcome time (s)')
p <- p + labs(y = 'cdf')
p <- p + scale_x_continuous(breaks = round(seq(0, max(clientWelcome$time), by = 15), 1))
p <- p + scale_y_continuous(breaks = seq(0, 1, by = 0.1))
p <- p + theme_bw()
p

pdf("/Users/Arthur/Workspace/cpsc527-development/report/successorships/paper/figures/client-welcome.pdf")
print(p)
dev.off()


p <- ggplot(clientWelcome, aes(x=numSuccessors, y=time))
p <- p + geom_boxplot()
p <- p + labs(x = 'Number of Successors')
p <- p + labs(y = 'Time (s)')
p <- p + scale_y_continuous(breaks = round(seq(0, max(clientWelcome$time), by = 5), 1))
p <- p + theme_bw()
p

pdf("/Users/Arthur/Workspace/cpsc527-development/report/successorships/paper/figures/client-welcome-successors.pdf")
print(p)
dev.off()


clientWelcome$SC <- predict(lm(time ~ pkgSize, data = clientWelcome))

p1 <- ggplot(clientWelcome, aes(x = pkgSize, y = time))
p1 <- p1 + labs(x = 'State size (bytes)')
p1 <- p1 + labs(y = 'Time (s)')
p1 <- p1 + geom_line(aes(y = SC))
p1 <- p1 + theme_bw()
p1



pdf("/Users/Arthur/Workspace/cpsc527-development/report/successorships/paper/figures/client-welcome-state-size.pdf")
print(p1)
dev.off()

# >> Message RTT

p <- ggplot(messageRTT, aes(time)) + stat_ecdf(geom = "step")
p <- p + labs(x = 'Messages RTT (ms)')
p <- p + labs(y = 'cdf')
p <- p + scale_x_continuous(breaks = seq(0, max(messageRTT$time), by = 25))
p <- p + scale_y_continuous(breaks = seq(0, 1, by = 0.1))
p <- p + theme_bw()
p


pdf("/Users/Arthur/Workspace/cpsc527-development/report/successorships/paper/figures/message-RTT.pdf")
print(p)
dev.off()

# >> State Convergence Time

p <- ggplot(stateConvergence, aes(time)) + stat_ecdf(geom = "step")
p <- p + labs(x = 'State Convergence (s)')
p <- p + labs(y = 'cdf')
p <- p + scale_y_continuous(breaks = seq(0, 1, by = 0.1))
p <- p + theme_bw()
p

pdf("/Users/Arthur/Workspace/cpsc527-development/report/successorships/paper/figures/state-convergence.pdf")
print(p)
dev.off()

p <- ggplot(stateConvergence, aes(x=numSuccessors, y=time))
p <- p + geom_boxplot()
p <- p + labs(x = 'Number of Successors')
p <- p + labs(y = 'Time (s)')
p <- p + scale_y_continuous(breaks = round(seq(0, max(stateConvergence$time), by = 5), 1))
p <- p + theme_bw()
p

pdf("/Users/Arthur/Workspace/cpsc527-development/report/successorships/paper/figures/state-convergence-successors.pdf")
print(p)
dev.off()



stateConvergence$SC <- predict(lm(time ~ pkgSize, data = stateConvergence))

p1 <- ggplot(stateConvergence, aes(x = pkgSize, y = time))
p1 <- p1 + labs(x = 'Operation Payload (bytes)')
p1 <- p1 + labs(y = 'Time (s)')
p1 <- p1 + geom_line(aes(y = SC))
p1 <- p1 + theme_bw()
p1

pdf("/Users/Arthur/Workspace/cpsc527-development/report/successorships/paper/figures/state-convergence-payload-size.pdf")
print(p1)
dev.off()

summary(stateConvergence$time)
sd(stateConvergence$time)

filter(stateConvergence, time > 2.5)


# Create CDFs as a function of package size and number of clients




d.f <- data.frame(
  grp = as.factor( rep( c("A","B"), each=40 ) ) ,
  val = c( sample(c(2:4,6:8,12),40,replace=TRUE), sample(1:4,40,replace=TRUE) )
)
d.f <- arrange(d.f,grp,val)
d.f.ecdf <- ddply(d.f, .(grp), transform, ecdf=ecdf(val)(val) )

p <- ggplot( d.f.ecdf, aes(val, ecdf, colour = grp) )
p + geom_step()







messageRTT




ggdata <- ddply(messageRTT, .(time), transform, ecd=ecdf(value)(value))

p <- ggplot(messageRTT, aes(time)) + stat_ecdf(aes(color=numSuccessors))
p
p <- p + labs(x = 'Server recovery time (s)')
p <- p + labs(y = 'cdf')
p <- p + scale_x_continuous(breaks = round(seq(0, max(serverRecovery$time), by = 25), 1))
p <- p + scale_y_continuous(breaks = seq(0, 1, by = 0.1))
p







df <- clientWelcome
df <- arrange(df, numSuccessors, time)
df.ecdf <- ddply(df, .(numSuccessors), transform, ecdf=ecdf(time)(time) )
p <- ggplot( df.ecdf, aes(time, ecdf, colour = numSuccessors) )
p <- p + geom_step()
p <- p + scale_x_continuous(breaks = round(seq(0, max(df$time), by = 15), 1))
p <- p + scale_y_continuous(breaks = seq(0, 1, by = 0.1))
p


df <- messageRTT
df <- arrange(df,numSuccessors,time)
df.ecdf <- ddply(df, .(numSuccessors), transform, ecdf=ecdf(time)(time) )

p <- ggplot( df.ecdf, aes(time, ecdf, colour = numSuccessors) )
p <- p + geom_step()
p

p <- p + scale_y_continuous(breaks = seq(0, 1, by = 0.25))
p

p <- p + scale_x_continuous(breaks = seq(0, max(messageRTT$time), by = 25))
