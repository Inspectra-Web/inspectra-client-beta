import { CertHero } from "@/components/enablement/CertHero";
import { CertStakes } from "@/components/enablement/CertStakes";
import { CertPathway } from "@/components/enablement/CertPathway";
import { CertSyllabus } from "@/components/enablement/CertSyllabus";
import { CertExam } from "@/components/enablement/CertExam";
import { CertProof } from "@/components/enablement/CertProof";
import { CertEnroll } from "@/components/enablement/CertEnroll";
import { CertFaq } from "@/components/enablement/CertFaq";

export function GetCertified() {
  return (
    <>
      <CertHero />
      <CertStakes />
      <CertPathway />
      <CertSyllabus />
      <CertExam />
      <CertProof />
      <CertEnroll />
      <CertFaq />
    </>
  );
}
