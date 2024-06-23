import React from "react";
import "../styles/tcs.css";
import Link from "next/link";
const Home = () => {
  return (
    <div className="dark:bg-black maindiv dark:text-white flex justify-center">
      <div className="pk mx-5 lg:w-1/2 my-10 rounded-2xl parent-container p-10 md:w-2/3  ">
        <div className="main bg-opacity-10 p-10 child-container rounded-2xl bg-white shadow-2xl border-1 border-black ">
          <div className="backdrop-filter backdrop-blur-md bg-opacity-30">
            <Link href="/">
              <div className="heading font-lucy text-center text-8xl my-5">
                Muse
              </div>
            </Link>
            <div className="tcs text-center text-4xl font-bold my-6 font-rethink">
              Terms And Conditions
            </div>
            <div className="">
              <div className="h11 font-rethink  text-justify ">
                <div>
                  <div className="font-bold text-2xl my-2">
                    1. Introduction & Definitions:
                  </div>
                  <p className="my-2">
                    <b className="text-xl font-bold my-2">1.1 Introduction:</b>{" "}
                    Welcome to <b>Muse</b>, provided by <b>NoFilter LLC</b>.
                    These Terms and Conditions govern your use of the App. By
                    accessing or using the App, you agree to be bound by these
                    Terms and Conditions. If you do not agree to these Terms and
                    Conditions, please refrain from using the App.
                  </p>
                  <p className="my-2">
                    <b className="text-xl font-bold">1.2 Definitions:</b>
                    <br />
                    - &quot;App&quot; refers to Muse.
                    <br />
                    - &quot;Company&quot; refers to NoFilter LLC, the provider
                    of the App.
                    <br />
                    - &quot;User&quot; refers to any individual who accesses or
                    uses the App.
                    <br />
                    - &quot;Content&quot; refers to any data, text, images,
                    videos, audio, or other materials posted, uploaded, or
                    shared on the App by Users.
                    <br />- &quot;Personal Data&quot; refers to any information
                    that identifies or can be used to identify a User.
                  </p>

                  <div className="text-2xl font-bold my-2 mt-5">
                    2. Account Creation & Registration:
                  </div>
                  <p>
                    <b className="text-bold text-xl my-2">
                      2.1 Age and Location Requirements:
                    </b>{" "}
                    You must be at least 18 years old or have reached the age of
                    majority in your jurisdiction to use the App. By using the
                    App, you represent and warrant that you meet these
                    eligibility requirements.
                  </p>
                  <p>
                    <b className="text-bold text-xl my-2">
                      2.2 Password Security:
                    </b>{" "}
                    During the registration process, you agree to provide
                    accurate, current, and complete information. You are
                    responsible for maintaining the confidentiality of your
                    account credentials and for all activities that occur under
                    your account.
                  </p>
                  <p>
                    <b className="text-bold text-xl my-2">
                      2.3 Prohibited Accounts:
                    </b>{" "}
                    Anonymous accounts or impersonation are strictly prohibited.
                    Users must provide genuine and verifiable information during
                    the registration process.
                  </p>

                  <div className="text-2xl font-bold my-2 mt-5">
                    3. Acceptable Use and Prohibited Conduct:
                  </div>
                  <p>
                    <b className="text-bold text-xl my-2">
                      3.1 Compliance with Laws:
                    </b>{" "}
                    You agree to comply with all applicable laws and regulations
                    while using the App, including but not limited to the
                    Information Technology Act, 2000 (IT Act), the Personal Data
                    Protection Bill, 2019 (PDPB), and the Indian Penal Code
                    (IPC).
                  </p>
                  <p>
                    <b className="text-bold text-xl my-2">
                      3.2 Content Guidelines:
                    </b>{" "}
                    You must not post any Content that violates the IPC,
                    including but not limited to hate speech, defamation,
                    obscenity, or content that promotes violence or illegal
                    activities.
                  </p>
                  <p>
                    <b className="text-bold text-xl my-2">
                      3.3 Misinformation and Disinformation:
                    </b>{" "}
                    Posting or spreading misinformation or disinformation is
                    strictly prohibited. Users are encouraged to verify the
                    accuracy of information before sharing it on the App.
                  </p>

                  <div className="text-2xl font-bold my-2 mt-5">
                    4. User Content & Intellectual Property:
                  </div>
                  <p>
                    <b className="text-bold text-xl my-2">
                      4.1 User Content Ownership:
                    </b>{" "}
                    You retain ownership of any Content you post, upload, or
                    share on the App. By posting Content, you grant the Company
                    a non-exclusive, transferable, sublicensable, royalty-free
                    license to use, reproduce, modify, adapt, publish,
                    translate, distribute, and display such Content on the App.
                  </p>
                  <p>
                    <b className="text-bold text-xl my-2">
                      4.2 Content Privacy Settings:
                    </b>{" "}
                    Users have control over their Content privacy settings and
                    deletion options. The Company respects the privacy choices
                    made by Users regarding their Content.
                  </p>
                  <p>
                    <b className="text-bold text-xl my-2">
                      4.3 Platform Ownership:
                    </b>{" "}
                    The App&apos;platform and infrastructure are owned and
                    operated by the Company. Users acknowledge that the Company
                    retains all rights, title, and interest in and to the App.
                  </p>

                  <div className="text-2xl font-bold my-2 mt-5">
                    5. Disclaimers & Limitations of Liability:
                  </div>
                  <p>
                    <b className="text-bold text-xl my-2">
                      5.1 Warranties Disclaimer:
                    </b>{" "}
                    The App is provided on an &quot;as-is&quot; and
                    &quot;as-available&quot; basis without warranties of any
                    kind, whether express or implied. The Company disclaims all
                    warranties, including but not limited to the implied
                    warranties of merchantability, fitness for a particular
                    purpose, or non-infringement.
                  </p>
                  <p>
                    <b className="text-bold text-xl my-2">
                      5.2 Limitation of Liability:
                    </b>{" "}
                    To the fullest extent permitted by law, the Company, its
                    officers, directors, employees, or agents shall not be
                    liable for any indirect, incidental, special, consequential,
                    or punitive damages arising out of or in connection with
                    your use of the App.
                  </p>
                  <p>
                    <b className="text-bold text-xl my-2">
                      5.3 User Responsibility:
                    </b>{" "}
                    Users are solely responsible for their interactions and
                    Content on the App. The Company does not endorse, support,
                    or guarantee the accuracy, completeness, or reliability of
                    any Content posted by Users.
                  </p>

                  <div className="text-2xl font-bold my-2 mt-5">
                    6. Privacy Policy:
                  </div>
                  <p>
                    <b className="text-xl font-bold my-2 mt-5">
                      6.1 Data Collection and Usage:
                    </b>{" "}
                    Our Privacy Policy governs the collection, use, and
                    disclosure of Personal Data. By using the App, you consent
                    to the collection, use, and disclosure of your Personal Data
                    as described in our Privacy Policy.
                  </p>
                  <p>
                    <b className="text-bold text-xl my-2">
                      6.2 Data Protection Obligations:
                    </b>{" "}
                    Once enacted, we will comply with the data protection
                    obligations outlined in the Personal Data Protection Bill,
                    2019 (PDPB), including user consent, data localization, and
                    cross-border data transfers.
                  </p>

                  <div className="text-2xl font-bold my-2 mt-5">
                    7. Termination & Modification:
                  </div>
                  <p>
                    <b className="text-bold text-xl my-2">
                      7.1 Account Termination:
                    </b>{" "}
                    The Company reserves the right to terminate or suspend your
                    access to the App immediately, without prior notice or
                    liability, for any reason whatsoever, including if you
                    breach these Terms.
                  </p>
                  <p>
                    <b className="text-bold text-xl my-2">
                      7.2 Terms Modification:
                    </b>{" "}
                    The Company reserves the right to modify or revise these
                    Terms at any time. Your continued use of the App following
                    the posting of any changes constitutes acceptance of those
                    changes.
                  </p>

                  <div className="text-2xl font-bold my-2 mt-5">
                    8. Governing Law & Dispute Resolution:
                  </div>
                  <p>
                    <b className="text-bold text-xl my-2">8.1 Governing Law:</b>{" "}
                    These Terms shall be governed by and interpreted under the
                    laws of India, without regard to its conflict of law
                    provisions.
                  </p>
                  <p>
                    <b className="text-bold text-xl my-2">8.2 Jurisdiction:</b>{" "}
                    Any legal action or proceeding arising out of or relating to
                    these Terms shall be brought exclusively in the Calcutta
                    High Court.
                  </p>

                  <div className="text-2xl font-bold my-2 mt-5">
                    9. Contact Information:
                  </div>
                  <p>
                    <b className="text-bold text-xl my-2">
                      9.1 Contact Details:
                    </b>{" "}
                    If you have any questions about these Terms, please contact
                    us at{" "}
                    <a href="mailto:connectonmuse@gmail.com">
                      connectonmuse@gmail.com
                    </a>
                  </p>

                  <p>
                    By using the App, you agree to these Terms and Conditions.
                    If you do not agree to these Terms and Conditions, please do
                    not use the App.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
