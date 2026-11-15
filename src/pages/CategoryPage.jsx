import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import SEO from '../seo/SEO';
import Breadcrumbs from '../components/common/Breadcrumbs';
import ProductCard from '../components/product/ProductCard';
import FAQAccordion from '../components/common/FAQAccordion';
import categoriesData from '../data/categories.json';
import productsData from '../data/products.json';

export default function CategoryPage() {
  const { slug } = useParams();
  const category = categoriesData[slug];

  if (!category) {
    return <Navigate to="/shop" replace />;
  }

  const categoryProducts = productsData.filter((p) => p.category === slug);

  // Extended intro copy (150 - 250 words)
  const categoryOverview = {
    'tissue-repair': `Tissue repair and cellular integrity peptides comprise an essential class of investigational biomolecules studied in extracellular matrix deposition, angiogenic capillary sprouting, and cellular migration cascades. In contemporary laboratory and academic research, compounds such as BPC-157, TB-500, KPV, and related peptide sequences are evaluated in standardized in vitro cell culture systems to elucidate interactions with vascular endothelial growth factor (VEGF), focal adhesion kinase phosphorylation, and transforming growth factor-beta (TGF-beta) pathways. These high-purity synthesized research peptides provide reproducible tools for characterizing how specific amino acid motifs influence fibroblast motility, collagen type I and III arrangement, and localized cytokine expression profiles. All compounds within this division are manufactured under strict solid-phase peptide synthesis (SPPS) parameters to guarantee purity exceeding ninety-eight percent, verified by reversed-phase high-performance liquid chromatography (HPLC) and electrospray ionization mass spectrometry. Materials are supplied exclusively for analytical, educational, and laboratory research investigations, and must not be administered to humans or animals.`,
    'cellular-energy': `Cellular energy and mitochondrial biology compounds represent critical chemical tools for investigating eukaryotic metabolic homeostasis, coenzyme recycling, and mitochondrial organelle integrity. This specialized catalogue encompasses mitochondrial-derived peptides like MOTS-c and SS-31 alongside small-molecule metabolic modulators such as 5-amino-1MQ, SLU-PP-332, AICAR, and high-purity coenzyme preparations including oxidized nicotinamide adenine dinucleotide (NAD+). In laboratory models, these reagents enable researchers to systematically analyze 5'-AMP-activated protein kinase (AMPK) activation kinetics, sirtuin deacetylation activity, cardiolipin peroxidation resistance, and electron transport chain efficiency. Each reagent is purified to analytical thresholds and subjected to comprehensive batch testing to confirm molecular identity and spectral purity. Designed specifically for academic, institutional, and in vitro experimental assays, these compounds provide reliable baseline reproducibility for exploring the biochemical pathways governing mitochondrial biogenesis, cellular bioenergetics, and metabolic pathway flux.`,
    'cosmetic-research': `Cosmetic and dermatological science compounds encompass bioactive peptide sequences and copper-binding complexes investigated in cutaneous cell biology, dermal fibroblast signaling, and extracellular matrix synthesis. Compounds in this research sector, including GHK-Cu, AHK-Cu, SNAP-8, and reduced Glutathione, serve as fundamental tools for examining collagen gene expression, matrix metalloproteinase (MMP) modulation, and cellular oxidative defense mechanisms in controlled cell culture models. In vitro studies utilize these standardized sequences to quantify changes in glycosaminoglycan production and examine the biochemical impact of copper-chelated peptide scaffolds on microvascular endothelial cells. Every compound is prepared with exceptional analytical fidelity, ensuring exact peptide content and stoichiometric balance verified through chromatographic peak integration. These products are provided strictly for laboratory research, cosmetic formulation development screening, and academic evaluation, and are not intended for consumer, cosmetic, or therapeutic applications.`,
    'growth-factors': `Growth factor and secretagogue biology reagents include synthetic peptide ligands engineered to evaluate receptor binding dynamics across endocrine and growth factor signaling networks. This category features selective ghrelin receptor (GHS-R1a) agonists such as Ipamorelin, GHRP-2, GHRP-6, and Hexarelin, growth hormone releasing hormone analogues (CJC-1295 with and without DAC), and insulin-like growth factor variants including IGF-1 LR3 and Mechano Growth Factor (MGF). In laboratory cell lines, these molecules are utilized to assess intracellular calcium mobilization, cyclic AMP response element activation, and downstream tyrosine kinase receptor autophosphorylation kinetics. Analytical verification via HPLC and LC-MS guarantees sequence fidelity, minimal residual trifluoroacetic acid, and absence of truncated impurities. These materials are prepared solely for qualified scientific and laboratory experimentation in cellular biology and receptor pharmacology.`,
    'neurobiology': `Neurobiology and cognitive research peptides are specialized synthetic analogues derived from endogenous regulatory neuropeptides and neurotrophic fragments. Included within this sector are molecules such as Semax, Selank, Delta Sleep-Inducing Peptide (DSIP), and FOXO4-DRI, which are investigated in academic laboratories for their interactions with neurotrophic factor expression (BDNF, NGF), neurotransmitter reuptake transporter kinetics, and slow-wave electrophysiological sleep architecture in preclinical animal models. Through selective amino acid modifications, these research peptides exhibit enhanced resistance to proteolytic peptidases in aqueous media, enabling precise measurement of downstream receptor signaling and cellular stress responses. Each production batch is authenticated with analytical HPLC chromatograms and molecular mass confirmation, formulated strictly for in vitro laboratory and academic neuroscience research.`,
    'metabolic-candidates': `Investigational metabolic candidates include novel multi-agonist peptide ligands synthesized for preclinical characterization of incretin receptor pathways. Molecules in this group, such as Retatrutide, Survodutide, Cagrilintide, and Adipotide, are studied for their simultaneous or selective receptor binding profiles at the gastric inhibitory polypeptide (GIP), glucagon-like peptide-1 (GLP-1), glucagon (GCGR), and amylin receptor complexes. In vitro binding affinity studies and cell membrane adenylate cyclase assays utilize these high-purity peptides to elucidate multi-receptor pharmacology and signal transduction cascades. Synthesized with meticulous sequence accuracy and documented via analytical lot certificates, these materials are intended exclusively for academic, pharmaceutical screening, and laboratory research investigations, and must not be used as clinical therapeutics or administered to human subjects.`,
    'blends-diluents': `Research blends and laboratory diluents provide calibrated multi-compound formulations and high-purity sterile diluent media designed for controlled experimental reconstitution and comparative co-culture assays. This division features standardized peptide combinations—such as the BB10, BB20, BBG70, GLOW, and KLOW blends—which unite complementary sequences at exact stoichiometric ratios to streamline simultaneous pathway evaluation in laboratory research. Complementing these blends is laboratory-grade sterile Bacteriostatic Water formulated with 0.9% benzyl alcohol preservative to prevent microbial contamination during extended reagent storage. Each component undergoes individual purity screening and batch testing to ensure analytical reproducibility and sterile handling compliance for academic and in vitro experimentation.`
  }[slug] || category.description;

  return (
    <>
      <SEO
        title={`${category.name} Research Compounds`}
        description={`Explore ${category.name} for laboratory research. HPLC verified purity ≥98%, batch-specific COAs. For in vitro research use only.`}
        canonicalPath={`/category/${slug}`}
        faqItems={category.faq}
        breadcrumbs={[
          { name: 'Shop Catalogue', url: '/shop' },
          { name: category.name, url: `/category/${slug}` },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          items={[
            { name: 'Shop', url: '/shop' },
            { name: category.name, url: `/category/${slug}` },
          ]}
        />

        {/* Category Header */}
        <div className="py-8 border-b border-[var(--border)] mb-10">
          
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-[var(--ink)] mb-4">
            {category.name}
          </h1>
          <div className="text-xs sm:text-sm text-[var(--ink-muted)] leading-relaxed max-w-4xl space-y-3">
            <p>{categoryOverview}</p>
          </div>
        </div>

        {/* Product Grid */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading font-bold text-lg text-[var(--ink)]">
              Available Compounds ({categoryProducts.length})
            </h2>
            <Link
              to="/shop"
              className="text-xs font-semibold text-[var(--chrome)] hover:text-[var(--ink)]"
            >
              Browse entire catalogue
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categoryProducts.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </div>

        {/* Category Specific FAQ */}
        {category.faq && category.faq.length > 0 && (
          <div className="pt-10 border-t border-[var(--border)] max-w-4xl">
            <div className="mb-6">
              <span className="text-xs font-mono uppercase tracking-widest text-[var(--chrome)] block mb-1">
                Common Questions
              </span>
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-[var(--ink)]">
                Frequently Asked Questions
              </h2>
            </div>
            <FAQAccordion items={category.faq} />
          </div>
        )}
      </div>
    </>
  );
}
