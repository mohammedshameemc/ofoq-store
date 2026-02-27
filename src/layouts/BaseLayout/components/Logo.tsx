import { Link } from "@mongez/react-router";

const Logo = () => {
  return (
    <div className="max-w-[200px] w-auto h-auto relative">
      <Link href="/">
        <img
          src="/ofoq-logo.png"
          alt="logo"
          className="w-full h-full"
          loading="lazy"
        />
      </Link>
    </div>
  );
};

export default Logo;
