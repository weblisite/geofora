import { Link } from "wouter";
import { GradientText } from "../ui/gradient-text";

export default function Footer() {
  return (
    <footer className="py-12 bg-dark-100">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="text-primary-500 flex items-center justify-center w-10 h-10 rounded-full bg-dark-200">
                <span className="material-icons">forum</span>
              </div>
              <span className="text-2xl font-bold">
                <GradientText>GeoFora</GradientText>
              </span>
            </Link>
            <p className="text-gray-400 mb-4">
              Transform your SEO strategy with AI-powered Q&A forums engineered by
              Silicon Valley's finest.
            </p>
            <div className="flex space-x-3">
              <a
                href="#"
                className="text-gray-400 hover:text-primary-400 transition-colors"
              >
                <span className="material-icons">facebook</span>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-primary-400 transition-colors"
              >
                <span className="material-icons">twitter</span>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-primary-400 transition-colors"
              >
                <span className="material-icons">linkedin</span>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-primary-400 transition-colors"
              >
                <span className="material-icons">youtube</span>
              </a>
            </div>
          </div>

          <div>
            <h5 className="text-white font-semibold mb-4">Product</h5>
            <ul className="space-y-2">
              <li>
                <Link href="/#features" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/case-studies" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Case Studies
                </Link>
              </li>
              <li>
                <Link href="/documentation" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/api-docs" className="text-gray-400 hover:text-primary-400 transition-colors">
                  API
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-semibold mb-4">Resources</h5>
            <ul className="space-y-2">
              <li>
                <a href="https://forum.cmofy.com" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Forum
                </a>
              </li>
              <li>
                <Link href="https://forum.cmofy.com" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Webinars
                </Link>
              </li>
              <li>
                <Link href="https://forum.cmofy.com" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="https://forum.cmofy.com" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Community
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Guides
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-semibold mb-4">Company</h5>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-primary-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/press" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Press
                </Link>
              </li>
              <li>
                <a href="mailto:support@geofora.ai" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <Link href="/partners" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Partners
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-dark-300 flex flex-col md:flex-row items-center justify-between">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} GeoFora. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-4 justify-center md:justify-end">
            <Link href="#" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">
              Cookies
            </Link>
            <Link href="#" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">
              Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}