---
layout: post
title: "The Connected Ledger"
---

![Azlo's Logo](/files/2021-01-16-the-connected-ledger/azlo-logo.svg)

Azlo as all good things do, is coming to an end. I am not normally too sad when a project comes to an end, it's all part of the game I suppose. But I am sad about the Connected Ledger. I spent the last ~3 years building the Connected Ledger at Azlo. The Connected Ledger was Leo Shapiro's brain child. It was going to be the FUTURE of Azlo and business banking too.

So what was the connected ledger? Well let me tell you. There were two fundamental parts to it. The first was a reconciliation engine. From the moment you connected a Stripe or Square account it got to work. It would look through your payouts and match them with your account deposits. This information allowed us to _enhance_ your ledger. 

The second part was a set of "second-level integrations" that used the extra information we could get from those transactions now that they were matched to their respective payouts. For basic payouts without any additional integrations we'd be able to show you what transactions were included in it. For invoices we'd be able to show the line items and who paid for it. If we detected an external platform we'd prompt you connect it with you ledger, that would allow use to enhance the transactions inside of a deposit and we'd be able to provide you with additional data about your sales in sites like Shopify or Wix.

This positioned your bank ledger, a normally boring and one dimensional tool, as the center of your business. It'd be able to generate reports and provide you with a clearer image of how things were going in your business and eventually provide you with suggestions on how to improve your business as a whole.

## So what's in a Connected Ledger?
Quite a bit actually. The main parts where the Cascader, the Providers, the Matchers, the Payouts, the Deposits and the Settlement. 

The payouts were normally ACH deposits that came from one of the payment processors like Stripe or Square but could also be direct invoice payments via deposit to your Azlo account. 

The deposits were those payouts that actually made it to your bank account. 

The providers where generally integrations our users connected to Azlo for either the Connected Ledger or Invoicing, this included things like Stripe, Square, Paypal, Wix, Shopify among others. 

Each provider did their best to match a Payout to a Deposit through whatever means were necessary. It was never easy and sometimes matches couldn't be made automatically even if we knew that there was one. This was necesary and hard because most of these payouts came via ACH which doesn't have a mechanism to include meaningful metadata along with the deposit. A lot of tweaking was involved as we took the match rate from around 50% to almost 95% by the time we released it to our first cohort of beta testers.

Each successful match would yield a Settlement. A settlement was nothing more than a record of how the match was made and the actual set of transactions that came as part of that payout. Once we had it we could run each through the matchers of the second-level integrations, integrations that didn't generate their own payouts but whose payouts came bundled in the another integration's. For example, you might have sold something on Wix using your Stripe account so we'd need to ask Wix about it to get a full picture.

The Cascader coordinated all of this, it took a first look at the transactions coming into your bank acccount and did it's best to find the provider with the best chance of matching it to a payout. It would normally determine one or two and run the transaction through their matchers.

This was all written in Node.js, using small functions that could be ran against a variety of data sources. At first we ran them against the provider's api but were in the process of migrating them to run on our datalake, that was collection the same information via webhooks.

## So why are you writing this?
Thank you for asking, I am just organizing my thoughts on what I was building and what I hoped to achieve. So long Azlo.