import { cn } from '@/lib/utils';
import React from 'react'
import { FaLinkedin ,FaGithub } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";


type socialLinks = "linked-in" | "twitter" | "github"
const GetSocialLinks = ({site, className} :{site : socialLinks, className? : string}) =>{
    const baseClassName = 'h-5 w-5 fill-foreground transition group-hover:fill-primary '


    if(site === "linked-in"){
        return <FaLinkedin  className={cn(baseClassName,className)} />
    }
    if(site === "github"){
        return <FaGithub  className={cn(baseClassName,className)} />
    }
    if(site === "twitter"){
        return <FaXTwitter  className={cn(baseClassName,className)} />
    }
}


const SocialLink = ({
  href,
  socialLink,
  children,
}: {
  href: string
  socialLink: socialLinks
  children: React.ReactNode
}) => {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="group">
      <span className="sr-only">{children}</span>
   
    <GetSocialLinks site={socialLink} />

    </a>
  )
}



const Footer = () => {
  return (
    <div className=" absolute bottom-5 flex px-6 w-full flex-col items-center justify-between gap-4 rounded-sm sm:flex-row justify-self-end self-end">
      <p className="text-sm">
        Copyright © {new Date().getFullYear()}{' '}
        <a
          href="https://brightdotdev.vercel.app"
          className="underline text-primary hover:underline-offset-4"
        >
            Brightdotdev
        </a>{' '}
      </p>
      <div className="flex gap-4">
        <SocialLink href="https://dub.sh/Brightdotdev-twitter" socialLink="twitter">
          Follow me on X
        </SocialLink>
        <SocialLink href="https://dub.sh/Brightdotdev-github"  socialLink="github">
          Follow me on GitHub
        </SocialLink>
        <SocialLink href="https://dub.sh/Brightdotdev-linkedin" socialLink="linked-in">
       Let's Connect On Linkedin
        </SocialLink>
      </div>
    </div>
  )
}

export default Footer