
# Quotes from email/paper

*Task*: clarify as much as we can about our API interface
>*Ivan’s quote* - I like that you’ve listed the interface, but.. it’s completely obscure. I don’t know what any of it means -- when these are called, by whom, what parameters mean, etc. `Please clarify as much as you can.`

*Task*: state assumptions about the network
>*Ivan’s quote* - Besides state semantics/size, networking assumptions you also have security assumptions. `It seems that all nodes must trust one another`. Please `state all assumptions up front somewhere`.

*Task*: rephrase motivation using considerations (1) and (2)
>*Ivan’s quote* Your motivation is slightly off. To communicate to local devices I can just connect to them using existing IP-based routing without going through the internet. But, for this `(1) the device needs to provide the service I need`, and `(2) I need to be able to find it and know to connect to it`. You are solving (1) by having all the local devices cache the ‘server’ code. And, you are solving (2) by mDNS and by hoping that people who are in the same room can find each other and coordinate the address to connect to/app to run.

*Task*: Refine introduction
>*Ivan’s quote* - The intro needs some refinement. I would merge 3.2 into intro as the running example; it’s a nice one.

*Task*: State which replication strategy we will use + detail one single replication that we will use
>*Ivan’s quote* - Related work in replication is fine, but it’s not very useful since you don’t `discuss trade-offs in the context of your system`. (`You don't even tell me which one you use!`). So, you don’t need that much RW, but `important to tell me about which you use and go deeper on that one replication type/RW`.

*Task*: Add opera and google nearby API in related work
>*Ivan’s quote* - I think that this is the Opera client/server feature that I was thinking about that resembles Flywheel to me. `This is definitely related work`. Ideal if you can `find other related work that is.. actually close to Flyweb` and your proposal :-)

*Task*: Rephrase statement about local architecture is rarely leveraged
>*Ivan’s quote* - not true. To access UBC.cs I do not leave UBC cs network

*Task*: Do not say that zero conf does not provide fault tolerance.
>*Ivan’s quote* -You should not criticize them for that. Just say that this is a problem to be solved

*Task*: Clearly state your goal
>*Ivan’s quote* - Good to clearly state your goal

*Task*: Break up evaluation section into two sections

*Task*: Suggest pcap lib for the evaluation

*Task*: We don’t say nothing about security. We assume that clients trust each other.