// app/routes/copyright.tsx
import type { Route } from "./+types/copyright";
import { Separator } from "../components/ui/separator";

export default function Copyright() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-6">
            <h1 className="text-2xl font-semibold text-blue-800 mb-4">Copyright Notice</h1>
            <h2 className="text-lg font-medium mb-6">Intellectual Property Protection and Usage Restrictions</h2>

            <div className="space-y-6 text-sm">
                <section>
                    <h3 className="font-semibold text-base mb-2">Ownership Statement</h3>
                    <p className="text-gray-700 leading-relaxed">
                        All questions, answers, explanations, and other review materials presented on NQESH Reviewer Pro are the exclusive intellectual property of Mark Anthony Llego and Eduventure Web Development Services. These materials are protected by Philippine and international copyright laws and treaties.
                    </p>
                    <p className="text-gray-700 font-medium mt-2">
                        © 2025 Mark Anthony Llego and Eduventure Web Development Services. All rights reserved.
                    </p>
                </section>

                <Separator />

                <section>
                    <h3 className="font-semibold text-base mb-2">License vs. Ownership</h3>
                    <p className="text-gray-700 leading-relaxed">
                        By purchasing access to NQESH Reviewer Pro, users are not purchasing copyright ownership of any content or materials. Users are purchasing a limited, non-transferable license to access and use the materials for personal educational purposes only.
                    </p>
                    <p className="text-gray-700 mt-2">This license:</p>
                    <ul className="list-disc pl-6 space-y-1 text-gray-700 mt-2">
                        <li>Does not transfer any intellectual property rights to the user</li>
                        <li>Is restricted to a single user account and cannot be shared</li>
                        <li>Permits personal use only for exam preparation purposes</li>
                        <li>May be revoked for violation of these terms</li>
                        <li>Expires according to the terms of your purchase or subscription</li>
                    </ul>
                    <p className="text-gray-700 mt-2">
                        Upon termination of your access, either through subscription expiration or account termination, you must cease all use of downloaded or saved materials and destroy any copies in your possession.
                    </p>
                </section>

                <Separator />

                <section>
                    <h3 className="font-semibold text-base mb-2">Usage Restrictions</h3>
                    <p className="text-gray-700 leading-relaxed">
                        Users of this website are explicitly prohibited from:
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-gray-700 mt-2">
                        <li>Copying, reproducing, or duplicating any content from NQESH Reviewer Pro</li>
                        <li>Distributing, sharing, or transmitting content to unauthorized users</li>
                        <li>Creating derivative works based on our review materials</li>
                        <li>Selling, licensing, or commercially exploiting any content</li>
                        <li>Scraping, data mining, or automated collection of content</li>
                        <li>Removing any copyright notices or attributions</li>
                        <li>Publicly displaying or performing content without permission</li>
                        <li>Claiming ownership or authorship of the materials</li>
                        <li>Using the materials to create competing products or services</li>
                    </ul>
                    <p className="text-gray-700 mt-3">
                        The content on NQESH Reviewer Pro is provided exclusively for personal, educational use by registered users. Access to and use of the content does not transfer any ownership rights or imply any license to use the content beyond personal study and preparation.
                    </p>
                </section>

                <Separator />

                <section>
                    <h3 className="font-semibold text-base mb-2">Enforcement</h3>
                    <p className="text-gray-700 leading-relaxed">
                        Unauthorized use of our intellectual property may result in legal action, including but not limited to claims for copyright infringement, injunctive relief, and monetary damages. We actively monitor for unauthorized use of our materials and will vigorously defend our intellectual property rights.
                    </p>
                    <p className="text-gray-700 mt-2">
                        Violations may also result in immediate termination of access without refund, in addition to any legal remedies pursued.
                    </p>
                </section>

                <Separator />

                <section>
                    <p className="text-gray-700">
                        For inquiries regarding licensing or permitted uses, please contact:<br />
                        <a href="mailto:support@nqesh.com" className="text-blue-600 hover:underline">support@nqesh.com</a>
                    </p>
                    <p className="text-gray-500 text-xs mt-6">
                        This copyright notice was last updated on April 2, 2025
                    </p>
                </section>
            </div>
        </div>
    );
}