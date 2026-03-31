import { trans } from "@mongez/localization";
import { useState } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

type VisibleSections = {
  about: boolean;
  information: boolean;
  quick: boolean;
  news: boolean;
};

export default function Footer() {
  const [visibleSections, setVisibleSections] = useState<VisibleSections>({
    about: false,
    information: false,
    quick: false,
    news: false,
  });

  const toggleVisibility = (section: keyof VisibleSections) => {
    if (window.innerWidth < 768) {
      setVisibleSections(prevState => ({
        ...prevState,
        [section]: !prevState[section],
      }));
    }
  };

  // Get environment variables
  const contactPhone = import.meta.env.VITE_CONTACT_PHONE || "+222-1800-262";
  const facebookUrl = import.meta.env.VITE_FACEBOOK_URL || "https://facebook.com";
  const instagramUrl = import.meta.env.VITE_INSTAGRAM_URL || "https://instagram.com";
  const whatsappUrl = import.meta.env.VITE_WHATSAPP_URL || "https://wa.me/9749562321211";

  return (
    <div className="bg-white min-h-80 px-2 pt-8 mx-auto ">
      <div className="bg-borderLight h-px mt-8 mb-8"></div>
      {/* <a href="/cart">cart</a> */}
      <div className="flex justify-between flex-col md:flex-row md:flex-wrap  lg:flex-nowrap items-start max-w-full">
        <div className="my-4 mx-auto bg-lightGray px-5 py-3 rounded-md mb-3 md:bg-transparent w-full md:w-[42%] lg:w-[30%]">
          <h3
            className="uppercase font-bold text-sm text-primary
               flex justify-between items-center"
            onClick={() => toggleVisibility("about")}>
            <span> {trans("aboutTheStore")} </span>
            <span className="flex items-center md:hidden text-lg text-center">
              {visibleSections.about ? <IoIosArrowUp /> : <IoIosArrowDown />}
            </span>
          </h3>
          <div
            className={`transition-all duration-500 ease-in-out flex  flex-col items-start mt-3 md:max-h-screen opacity-100  ${
              visibleSections.about
                ? "max-h-screen opacity-100"
                : "max-h-0 opacity-0 overflow-hidden"
            }`}>
            <p className="text-gray font-medium text-sm leading-8">
              {trans("gotQuestion")}
            </p>
            <a
              href="#"
              className="text-blue text-4xl font-medium leading-9 mb-5 block">
              <p>{contactPhone}</p>
            </a>
            <p className="font-medium text-sm leading-6 text-gray text-start">
              Ofoq Trading, Ain Khalid, Doha, Qatar
            </p>
            <p className="font-medium text-sm leading-6 text-gray">
              admin@ofoqbookstore.com
            </p>
            {/* <a
              href="mailto:Aloshopify@ofoqbookstore.com"
              className="font-medium text-sm leading-6 text-gray">
              Aloshopify@ofoqbookstore.com
            </a> */}
          </div>
        </div>

        <div className="my-4 mx-auto bg-lightGray px-5 py-3 rounded-md mb-3  md:bg-transparent w-full md:max-w-[42%] lg:w-[15%]">
          <h3
            className="uppercase font-bold text-sm text-primary
               flex justify-between items-center"
            onClick={() => toggleVisibility("information")}>
            <span> {trans("Customer Service")} </span>
            <span className="flex items-center md:hidden text-lg text-center">
              {visibleSections.information ? (
                <IoIosArrowUp />
              ) : (
                <IoIosArrowDown />
              )}
            </span>
          </h3>
          <div
            className={`transition-all duration-500 ease-in-out flex md:max-h-screen opacity-100 ${
              visibleSections.information
                ? "max-h-screen opacity-100"
                : "max-h-0 opacity-0 overflow-hidden"
            } flex-col items-start mt-3 gap-2`}>
            <a
              href="/faq"
              className="text-gray hover:text-blue text-sm leading-6 transition-colors">
              {trans("FAQ")}
            </a>
            <a
              href="/terms-conditions"
              className="text-gray hover:text-blue text-sm leading-6 transition-colors">
              {trans("Terms & Conditions")}
            </a>
            <a
              href="/privacy-policy"
              className="text-gray hover:text-blue text-sm leading-6 transition-colors">
              {trans("Privacy Policy")}
            </a>
            <a
              href="/contact-us"
              className="text-gray hover:text-blue text-sm leading-6 transition-colors">
              {trans("Return Policy")}
            </a>
          </div>
        </div>

        <div className="my-4 mx-auto bg-lightGray px-5 py-3 rounded-md mb-3  md:bg-transparent w-full md:max-w-[42%] lg:w-[15%]">
          <h3
            className="uppercase font-bold text-sm text-primary
               flex justify-between items-center"
            onClick={() => toggleVisibility("quick")}>
            <span> {trans("quickLinks")} </span>
            <span className="flex items-center md:hidden text-lg text-center">
              {visibleSections.quick ? <IoIosArrowUp /> : <IoIosArrowDown />}
            </span>
          </h3>
          <div
            className={`transition-all duration-500 ease-in-out flex md:max-h-screen opacity-100 ${
              visibleSections.quick
                ? "max-h-screen opacity-100"
                : "max-h-0 opacity-0 overflow-hidden"
            } flex-col items-start mt-3 gap-2`}>
            <a
              href="/"
              className="text-gray hover:text-blue text-sm leading-6 transition-colors">
              {trans("Home")}
            </a>
            <a
              href="/products"
              className="text-gray hover:text-blue text-sm leading-6 transition-colors">
              {trans("Shop")}
            </a>
            <a
              href="/contact-us"
              className="text-gray hover:text-blue text-sm leading-6 transition-colors">
              {trans("Contact Us")}
            </a>
            <a
              href="/about"
              className="text-gray hover:text-blue text-sm leading-6 transition-colors">
              {trans("About Us")}
            </a>
          </div>
        </div>

        {/* <div className="my-4 mx-auto bg-lightGray px-5 py-3 rounded-md mb-3  md:bg-transparent w-full md:w-[48%] lg:w-[35%]">
          <h3
            className="uppercase font-bold text-sm text-primary
               flex justify-between items-center"
            onClick={() => toggleVisibility("news")}>
            <span> {trans("newsletterSignup")} </span>
            <span className="flex items-center md:hidden text-lg text-center">
              {visibleSections.news ? <IoIosArrowUp /> : <IoIosArrowDown />}
            </span>
          </h3>
          <div
            className={`transition-all duration-500 ease-in-out flex md:max-h-screen opacity-100 ${
              visibleSections.news
                ? "max-h-screen opacity-100"
                : "max-h-0 opacity-0 overflow-hidden"
            } flex-col items-start mt-3`}>
            <p className="text-gray text-sm leading-8 md:max-w-80 text-start">
              {trans("join")}
            </p>

            <SubscribeToNewsletter />

            <p className="text-gray text-sm leading-8 md:max-w-80 text-start">
              {trans("subscribeForOfoq")}
            </p>
          </div>
        </div> */}
      </div>

      <div className="bg-borderLight h-px mt-8 mb-8"></div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center my-6 mx-8 gap-6">
        <div className="w-full lg:w-auto text-start">
          <p className="font-medium text-sm leading-8 text-gray">
            {trans("copyright")} &copy;{" "}
            <a href="#" className="text-blue font-semibold">
              Ofoq Trading {""}
            </a>
            {trans("allRights")}.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
          <div className="flex items-center gap-3">
            <p className="text-sm text-gray font-semibold whitespace-nowrap">{trans("Follow Us")}:</p>
            <div className="flex gap-2">
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-blue flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 text-gray-700 hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-blue flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 text-gray-700 hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-blue flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 text-gray-700 hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
