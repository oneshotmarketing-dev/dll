// Both pages carry the client's supplied text verbatim:
//   Privacy Policy.docx        (July 2026)
//   Terms and Conditions.docx  (July 2026)
// Reproduced as-provided at the client's instruction — do not reword without
// their sign-off. NOTE: several T&C clauses arrived as drafting notes to the
// author ("State that…", "Include a clause stating that…") rather than finished
// terms; flagged to the client, kept verbatim pending their revision.

export interface LegalSection {
  heading: string;
  /** One or more paragraphs, rendered in order. */
  body: string[];
  /** Optional bulleted list, rendered after `body`. */
  bullets?: string[];
  /** Optional paragraphs rendered after `bullets`. */
  outro?: string[];
}

export interface LegalPage {
  slug: "privacy" | "terms";
  title: string;
  updated: string;
  /** Optional lead paragraphs shown above the sections. */
  intro?: string[];
  sections: LegalSection[];
}

export const legalPages: Record<LegalPage["slug"], LegalPage> = {
  privacy: {
    slug: "privacy",
    title: "Privacy Policy",
    updated: "Last updated: July 2026",
    intro: [
      "This privacy notice provides you with details of how we collect and process your personal data through your use of our site www.deeslanguagelounge.com",
      "Dees Language Lounge is the data controller and we are responsible for your personal data (referred to as \"we\", \"us\" or \"our\" in this privacy notice).",
    ],
    sections: [
      {
        heading: "Contact details",
        body: [
          "It is important that the information we hold about you is accurate and up to date. Please let us know if at any time your personal information changes by emailing us at deeslanguagelounge@gmail.com",
        ],
      },
      {
        heading: "What data do we collect about you, for what purpose and on what ground we process it",
        body: [
          "Personal data means any information capable of identifying an individual. It does not include anonymised data.",
          "We may process the following categories of personal data about you:",
          "Communication Data that includes any communication that you send to us whether that be through the contact form on our website, through email, text, social media messaging, social media posting or any other communication that you send us. We process this data for the purposes of communicating with you, for record keeping and for the establishment, pursuance or defence of legal claims. Our lawful ground for this processing is our legitimate interests which in this case are to reply to communications sent to us, to keep records and to establish, pursue or defend legal claims.",
          "Customer Data that includes data relating to any purchases of goods and/or services such as your name, title, address, email address, phone number, contact details, purchase details and your card details. We process this data to supply the goods and/or services you have purchased and to keep records of such transactions. Our lawful ground for this processing is the performance of a contract between you and us and/or taking steps at your request to enter into such a contract.",
          "User Data that includes data about how you use our website and any online services together with any data that you post for publication on our website or through other online services. We process this data to operate our website and ensure relevant content is provided to you, to ensure the security of our website, to maintain back-ups of our website and/or databases and to enable publication and administration of our website, other online services and business. Our lawful ground for this processing is our legitimate interests which in this case are to enable us to properly administer our website and our business.",
          "Technical Data that includes data about your use of our website and online services such as your IP address, your login data, details about your browser, length of visit to pages on our website, page views and navigation paths, details about the number of times you use our website, time zone settings and other technology on the devices you use to access our website. The source of this data is from our analytics tracking system. We process this data to analyse your use of our website and other online services, to administer and protect our business and website, to deliver relevant website content and advertisements to you and to understand the effectiveness of our advertising. Our lawful ground for this processing is our legitimate interests which in this case are to enable us to properly administer our website and our business and to grow our business and to decide our marketing strategy.",
          "Marketing Data that includes data about your preferences in receiving marketing from us and our third parties and your communication preferences. We process this data to enable you to partake in our promotions such as competitions, prize draws and free give-aways, to deliver relevant website content and advertisements to you and measure or understand the effectiveness of this advertising. Our lawful ground for this processing is our legitimate interests which in this case are to study how customers use our products/services, to develop them, to grow our business and to decide our marketing strategy",
          "We may use Customer Data, User Data, Technical Data and Marketing Data to deliver relevant website content and advertisements to you (including Facebook adverts or other display advertisements) and to measure or understand the effectiveness of the advertising we serve you. Our lawful ground for this processing is legitimate interests which is to grow our business. We may also use such data to send other marketing communications to you. Our lawful ground for this processing is either consent or legitimate interests (namely to grow our business).",
        ],
      },
      {
        heading: "Sensitive data",
        body: [
          "We do not collect any Sensitive Data about you. Sensitive data refers to data that includes details about your race or ethnicity, religious or philosophical beliefs, sex life, sexual orientation, political opinions, trade union membership, information about your health and genetic and biometric data. We do not collect any information about criminal convictions and offences.",
          "Where we are required to collect personal data by law, or under the terms of the contract between us and you do not provide us with that data when requested, we may not be able to perform the contract (for example, to deliver goods or services to you). If you don't provide us with the requested data, we may have to cancel a product or service you have ordered but if we do, we will notify you at the time.",
          "We will only use your personal data for a purpose it was collected for or a reasonably compatible purpose if necessary. In case we need to use your details for an unrelated new purpose we will let you know and explain the legal grounds for processing.",
          "We may process your personal data without your knowledge or consent where this is required or permitted by law.",
        ],
      },
      {
        heading: "How we collect your personal data",
        body: [
          "We may collect data about you by you providing the data directly to us (for example by filling in forms on our site or by sending us emails). We may automatically collect certain data from you as you use our website by using cookies and similar technologies.",
          "We may receive data from third parties such as analytics providers such as Google, advertising networks such as Facebook, such as search information providers such as Google, providers of technical, payment and delivery services, such as data brokers or aggregators.",
        ],
      },
      {
        heading: "Marketing communications",
        body: [
          "Our lawful ground of processing your personal data to send you marketing communications is either your consent or our legitimate interests (namely to grow our business).",
          "[Under the Privacy and Electronic Communications Regulations, we may send you marketing communications from us if (i) you made a purchase or asked for information from us about our goods or services or (ii) you agreed to receive marketing communications and in each case you have not opted out of receiving such communications since. Under these regulations, if you are a limited company, we may send you marketing emails without your consent. However you can still opt out of receiving marketing emails from us at any time.]",
          "Before we share your personal data with any third party for their own marketing purposes we will get your express consent.",
          "You can ask us or third parties to stop sending you marketing messages at any time by following the opt-out links on any marketing message sent to you or OR by emailing us at deeslanguagelounge@gmail.com at any time.",
          "If you opt out of receiving marketing communications this opt-out does not apply to personal data provided as a result of other transactions, such as purchases, warranty registrations etc.",
        ],
      },
      {
        heading: "Disclosures of your personal data",
        body: ["We may have to share your personal data with the parties set out below:"],
        bullets: [
          "Service providers who provide IT and system administration services.",
          "Professional advisers including lawyers, bankers, auditors and insurers",
          "Government bodies that require us to report processing activities.",
          "Third parties to whom we sell, transfer, or merge parts of our business or our assets.",
        ],
        outro: [
          "We require all third parties to whom we transfer your data to respect the security of your personal data and to treat it in accordance with the law. We only allow such third parties to process your personal data for specified purposes and in accordance with our instructions.",
        ],
      },
      {
        heading: "Data security",
        body: [
          "We have put in place security measures to prevent your personal data from being accidentally lost, used, altered, disclosed, or accessed without authorisation. We also allow access to your personal data only to those employees and partners who have a business need to know such data. They will only process your personal data on our instructions and they must keep it confidential.",
          "We have procedures in place to deal with any suspected personal data breach and will notify you and any applicable regulator of a breach if we are legally required to.",
        ],
      },
      {
        heading: "Data retention",
        body: [
          "We will only retain your personal data for as long as necessary to fulfil the purposes we collected it for, including for the purposes of satisfying any legal, accounting, or reporting requirements.",
          "When deciding what the correct time is to keep the data for we look at its amount, nature and sensitivity, potential risk of harm from unauthorised use or disclosure, the processing purposes, if these can be achieved by other means and legal requirements.",
          "For tax purposes the law requires us to keep basic information about our customers (including Contact, Identity, Financial and Transaction Data) for six years after they stop being customers.",
          "In some circumstances we may anonymise your personal data for research or statistical purposes in which case we may use this information indefinitely without further notice to you.",
        ],
      },
      {
        heading: "Your legal rights",
        body: [
          "Under data protection laws you have rights in relation to your personal data that include the right to request access, correction, erasure, restriction, transfer, to object to processing, to portability of data and (where the lawful ground of processing is consent) to withdraw consent.",
          "If you wish to exercise any of the rights set out above, please email us at deeslanguagelounge@gmail.com",
          "You will not have to pay a fee to access your personal data (or to exercise any of the other rights). However, we may charge a reasonable fee if your request is clearly unfounded, repetitive or excessive or refuse to comply with your request in these circumstances.",
          "We may need to request specific information from you to help us confirm your identity and ensure your right to access your personal data (or to exercise any of your other rights). This is a security measure to ensure that personal data is not disclosed to any person who has no right to receive it. We may also contact you to ask you for further information in relation to your request to speed up our response.",
          "We try to respond to all legitimate requests within one month. Occasionally it may take us longer than a month if your request is particularly complex or you have made a number of requests. In this case, we will notify you.",
        ],
      },
      {
        heading: "Third-party links",
        body: [
          "This website may include links to third-party websites, plug-ins and applications. Clicking on those links or enabling those connections may allow third parties to collect or share data about you. We do not control these third-party websites and are not responsible for their privacy statements. When you leave our website, we encourage you to read the privacy notice of every website you visit.",
        ],
      },
      {
        heading: "Cookies",
        body: [
          "You can set your browser to refuse all or some browser cookies, or to alert you when websites set or access cookies. If you disable or refuse cookies, please note that some parts of this website may become inaccessible or not function properly. For more information about the cookies we use.",
        ],
      },
    ],
  },
  terms: {
    slug: "terms",
    title: "Terms and Conditions",
    updated: "Last updated: July 2026",
    sections: [
      {
        heading: "Service Description",
        body: [
          "Clearly state what your language classes include (e.g., live Zoom sessions, recorded materials, PDF handouts, and duration of the course).",
        ],
      },
      {
        heading: "Payment & Refund Policy",
        body: [],
        bullets: ["State that fees must be paid in advance.", "No refunds policy"],
      },
      {
        heading: "Class Conduct",
        body: [
          "Expected behavior from students (e.g., punctuality, respectful communication). Mention that disruptive behavior will lead to removal from the class without a refund.",
        ],
      },
      {
        heading: "Intellectual Property",
        body: [
          "State that all course materials (slides, videos, notes) belong to your brand and cannot be shared, copied, or sold by students.",
        ],
      },
      {
        heading: "Technical Requirements",
        body: [
          "Students are responsible for their own internet connection and device compatibility (e.g., Zoom/Google Meet). You are not responsible for technical failures on their end.",
        ],
      },
      {
        heading: "Limitation of Liability",
        body: ["Include a clause stating that you are not liable for any specific academic outcome."],
      },
      {
        heading: "Transfer",
        body: [
          "The students do not have rights to change the batch once the registration is done. A transfer can be granted only in exceptional cases. Transfer fees of Rs 2000/- will be charged if less than 8 hours class is done. Otherwise 50% will be charged. The request for transfer has to be given in writing to the office.",
        ],
      },
      {
        heading: "No Certificate",
        body: ["If the student does not attend the exam, no certificate will be issued to the student."],
      },
      {
        heading: "Faculty",
        body: [
          "For any reason your teacher cannot take a class, we will provide a substitute instructor to ensure the session is completed. We make sure that your time is not wasted and your learning journey stays on track.",
        ],
      },
    ],
  },
};
