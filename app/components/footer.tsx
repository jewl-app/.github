import type { ReactElement } from "react";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXTwitter, faDiscord, faGithub } from "@fortawesome/free-brands-svg-icons";
import Button from "@/app/components/button";

export default function Footer(): ReactElement {

  return (
    <div className="text-sm flex justify-center mx-1">
      <span className="p-1 grow">Copyright © 2024 jewl</span>
      <span className="grow" />
      <Button href="https://twitter.com/jewl_app" className="p-1 px-2">
        <FontAwesomeIcon className="h-full" icon={faXTwitter} />
      </Button>
      <Button href="https://discord.gg/w9DpyG6ddG" className="p-1 px-2">
        <FontAwesomeIcon className="h-full" icon={faDiscord} />
      </Button>
      <Button href="https://github.com/jewl-app" className="p-1 px-2">
        <FontAwesomeIcon className="h-full" icon={faGithub} />
      </Button>
    </div>
  );
}
