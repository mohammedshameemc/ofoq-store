import React from "react";

import ContactForm from "app/contact-us/components/ContactForm";
import ContactInfo from "app/contact-us/components/ContactInfo";
import Breadcrumbs from "design-system/components/Breadcrumbs";

function _ContactUsPage() {
  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 py-6 ">
      <Breadcrumbs title="contact us" />
      <div className="flex flex-col gap-14 my-5">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3609.8862434139905!2d51.4808993!3d25.207058500000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e45d162809a37dd%3A0xfc37deae3f661168!2sOFOQ%20Trading!5e0!3m2!1sen!2sin!4v1770926421235!5m2!1sen!2sin"
          width="100%"
          height="600"
          style={{ border: "0" }}
          loading="lazy"></iframe>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ContactForm />
          <ContactInfo />
        </div>
      </div>
    </div>
  );
}

const ContactUsPage = React.memo(_ContactUsPage);
export default ContactUsPage;
