<!-- 
This file provides your users an overview of your extension. All content is optional, but this is the recommended format. Your users will see the contents of this file when they run the `firebase ext:info` command.

Include any important functional details as well as a brief description for any additional setup required by the user (both pre- and post-installation).

Learn more about writing a PREINSTALL.md file in the docs:
https://firebase.google.com/docs/extensions/publishers/user-documentation#writing-preinstall
-->

Use this extension to allow your community of users to authenticate with Cardano Web3 wallets.

## Before Start

This extension requires a certificate of [the service account](https://firebase.google.com/support/guides/service-accounts). To generate it go to **Firebase Console** > **Your Project** > **Project Settings** > **Service Accounts** and click the **Generate new private key** button.

Your service account must have the **Service Account Token Creator** role. This extension needs it to issue [custom tokens](https://firebase.google.com/docs/auth/admin/create-custom-tokens).

During the installation process the installer will ask you about the certificate. Before you answer, you need to convert the certificate to extension variables. We created an online converter that automates this process.

*  [🛠 Open Service Account Converter](https://moralisweb3.github.io/firebase-extensions/service-account-converter/)

<!-- We recommend keeping the following section to explain how billing for Firebase Extensions works -->
## Billing

This extension uses the following services:

* Firebase Cloud Functions and Firebase Authentication, this extension requires the pay as you go plan ([pricing](https://firebase.google.com/pricing))
* [Secret Manager](https://cloud.google.com/secret-manager/) service ([pricing](https://cloud.google.com/secret-manager/pricing)) from the Google Cloud to protect a sensitive configuration of the extension
* Moralis Auth API ([pricing](https://moralis.io/pricing/)) to handle an authentication flow.

You are responsible for any costs associated with your use of these services.
