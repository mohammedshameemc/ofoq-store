import { trans } from "@mongez/localization";
import Helmet from "@mongez/react-helmet";
import Breadcrumbs from "design-system/components/Breadcrumbs";
import { Separator } from "design-system/components/ui/separator";
import { memo } from "react";
import mainAboutImage from "shared/assets/images/img_about.webp";
import about1Image from "shared/assets/images/img_about_1.webp";
import about2Image from "shared/assets/images/img_about_2.webp";
import about3Image from "shared/assets/images/img_about_3.webp";

function _AboutPage() {
  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 py-6">
      <Helmet title="About Us" />
      <Breadcrumbs title="About" />
      <div className="flex items-center flex-col gap-10 justify-center my-8 overflow-hidden">
        <div className="w-full max-w-[600px]">
          <p className="text-xs uppercase font-bold text-blue text-center">
            {trans("Welcome To Ofoq")}
          </p>
          <h1 className="text-3xl font-semibold text-primary text-center">
            {trans("Ofoq Trading & Services")}
          </h1>
          <p className="text-sm text-gray text-center">
            {trans("ofoq_about_intro")}
          </p>
        </div>
        <div className="overflow-hidden rounded-xl">
          <img
            loading="lazy"
            src={mainAboutImage}
            alt="About Image"
            className="w-full h-full max-h-[500px] transform transition-transform duration-300 ease-in-out hover:scale-105"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full gap-5">
          <div className="flex flex-col items-center justify-center gap-1 w-full text-center">
            <h1 className="text-blue text-4xl font-bold">500+</h1>
            <p className="text-primary text-lg font-semibold">
              {trans("Gadgets & Toys")}
            </p>
            <span className="text-sm text-gray font-medium">
              {trans("Curated products for all ages")}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1 w-full text-center">
            <h1 className="text-blue text-4xl font-bold">Qatar</h1>
            <p className="text-primary text-lg font-semibold">
              {trans("Based in Qatar")}
            </p>
            <span className="text-sm text-gray font-medium">
              {trans("Serving customers nationwide")}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1 w-full text-center">
            <h1 className="text-blue text-4xl font-bold">Vision</h1>
            <p className="text-primary text-lg font-semibold">
              {trans("Growing at Scale")}
            </p>
            <span className="text-sm text-gray font-medium">
              {trans("Building one of Qatar's leading retail brands")}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1 w-full text-center">
            <h1 className="text-blue text-4xl font-bold">7D</h1>
            <p className="text-primary text-lg font-semibold">
              {trans("Customer Support")}
            </p>
            <span className="text-sm text-gray font-medium">
              {trans("Fast response and reliable after-sales service")}
            </span>
          </div>
        </div>
        <Separator className="my-5" />
        <div className="w-full max-w-[600px]">
          <p className="text-xs uppercase font-bold text-blue text-center">
            {trans("Why Choose Us")}
          </p>
          <h1 className="text-3xl font-semibold text-primary text-center">
            {trans("More Than a Store")}
          </h1>
          <p className="text-sm text-gray text-center">
            {trans("ofoq_mission")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full gap-6">
          <div className="flex flex-col items-start justify-start gap-3 rounded-xl w-full">
            <div className="overflow-hidden">
              <img
                loading="lazy"
                src={about1Image}
                alt={trans("Quality products")}
                className=" w-full h-[550px] transform transition-transform duration-300 ease-in-out hover:scale-105"
              />
            </div>
            <h1 className="text-primary text-md uppercase font-bold">
              1. {trans("Quality products")}
            </h1>
            <p className="text-gray text-sm font-medium">
              {trans(
                "We handpick gadgets and toys for quality, safety, and value",
              )}
            </p>
          </div>
          <div className="flex flex-col items-start justify-start gap-3 rounded-xl w-full">
            <div className="overflow-hidden">
              <img
                loading="lazy"
                src={about2Image}
                alt={trans("Local insight")}
                className=" w-full h-[550px] transform transition-transform duration-300 ease-in-out hover:scale-105"
              />
            </div>
            <h1 className="text-primary text-md uppercase font-bold">
              2. {trans("Local insight")}
            </h1>
            <p className="text-gray text-sm font-medium">
              {trans(
                "Built in Qatar to match local needs, trends, and expectations",
              )}
            </p>
          </div>
          <div className="flex flex-col items-start justify-start gap-3 rounded-xl w-full">
            <div className="overflow-hidden">
              <img
                loading="lazy"
                src={about3Image}
                alt={trans("Future-ready growth")}
                className=" w-full h-[550px] transform transition-transform duration-300 ease-in-out hover:scale-105"
              />
            </div>
            <h1 className="text-primary text-md uppercase font-bold">
              3. {trans("Future-ready growth")}
            </h1>
            <p className="text-gray text-sm font-medium">
              {trans(
                "We are expanding to become a large-scale trading company in Qatar",
              )}
            </p>
          </div>
        </div>

        <Separator className="my-5" />

        <div className="w-full max-w-[600px]">
          <p className="text-xs uppercase font-bold text-blue text-center">
            {trans("Our Team")}
          </p>
          <h1 className="text-3xl font-semibold text-primary text-center">
            {trans("People Behind Ofoq")}
          </h1>
          <p className="text-sm text-gray text-center">
            {trans(
              "A dedicated team focused on trust, service, and long-term growth",
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full gap-5">
          <div className="flex flex-col items-center justify-center gap-3 rounded-full text-center">
            <div className="overflow-hidden rounded-full">
              <img
                loading="lazy"
                src={
                  "https://demo-uminex.myshopify.com/cdn/shop/files/img_our_team_360x.png?v=1677665288"
                }
                alt={trans("Team member")}
                className="w-[200px] h-[200px] rounded-full transform transition-transform duration-300 ease-in-out hover:scale-105"
              />
            </div>
            <h1 className="text-primary text-sm font-semibold">
              {trans("Ofoq Leadership")}
            </h1>
            <span className="text-sm text-gray">{trans("Founder / CEO")}</span>
            <p className="text-gray text-md">
              {trans("Leading Ofoq's strategy and nationwide growth vision")}
            </p>
          </div>
          <div className="flex flex-col items-center justify-center gap-3 rounded-full text-center">
            <div className="overflow-hidden rounded-full">
              <img
                loading="lazy"
                src={
                  "https://demo-uminex.myshopify.com/cdn/shop/files/img_our_team_3_360x.png?v=1677665306"
                }
                alt={trans("Team member")}
                className="w-[200px] h-[200px] rounded-full transform transition-transform duration-300 ease-in-out hover:scale-105"
              />
            </div>
            <h1 className="text-primary text-sm font-semibold">
              {trans("Operations Team")}
            </h1>
            <span className="text-sm text-gray">
              {trans("Operations & Supply")}
            </span>
            <p className="text-gray text-md">
              {trans(
                "Ensuring fast sourcing, inventory quality, and smooth delivery",
              )}
            </p>
          </div>
          <div className="flex flex-col items-center justify-center gap-3 rounded-full text-center">
            <div className="overflow-hidden rounded-full">
              <img
                loading="lazy"
                src={
                  "https://demo-uminex.myshopify.com/cdn/shop/files/img_our_team_2_360x.png?v=1677665299"
                }
                alt={trans("Team member")}
                className="w-[200px] h-[200px] rounded-full transform transition-transform duration-300 ease-in-out hover:scale-105"
              />
            </div>
            <h1 className="text-primary text-sm font-semibold">
              {trans("Customer Experience")}
            </h1>
            <span className="text-sm text-gray">{trans("Customer Care")}</span>
            <p className="text-gray text-md">
              {trans("Supporting customers before and after every purchase")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const AboutPage = memo(_AboutPage);
export default AboutPage;
