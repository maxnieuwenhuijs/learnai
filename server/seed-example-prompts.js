const { sequelize } = require('./src/config/database');
const { PromptCategory, Prompt, User, Company, PromptVersion } = require('./src/models');

const examplePrompts = [
    // Educatief
    {
        categoryName: 'Educatief',
        title: 'Conceptuitleg Template',
        description: 'Template voor het uitleggen van complexe concepten aan nieuwe gebruikers',
        content: `Hallo {{user_name}},

Laat me je {{concept_name}} uitleggen op een eenvoudige manier:

**Wat is {{concept_name}}?**
{{concept_description}}

**Waarom is dit belangrijk?**
{{importance_explanation}}

**Hoe werkt het in de praktijk?**
{{practical_example}}

**Volgende stappen:**
1. {{step_1}}
2. {{step_2}}
3. {{step_3}}

Heb je vragen? Neem gerust contact op!

Met vriendelijke groet,
{{sender_name}}`,
        variables: [
            { name: 'user_name', type: 'string', default: '', description: 'Naam van de gebruiker' },
            { name: 'concept_name', type: 'string', default: '', description: 'Naam van het concept dat uitgelegd wordt' },
            { name: 'concept_description', type: 'text', default: '', description: 'Beschrijving van het concept' },
            { name: 'importance_explanation', type: 'text', default: '', description: 'Waarom is dit concept belangrijk' },
            { name: 'practical_example', type: 'text', default: '', description: 'Praktisch voorbeeld of use case' },
            { name: 'step_1', type: 'string', default: '', description: 'Eerste actie stap' },
            { name: 'step_2', type: 'string', default: '', description: 'Tweede actie stap' },
            { name: 'step_3', type: 'string', default: '', description: 'Derde actie stap' },
            { name: 'sender_name', type: 'string', default: '', description: 'Naam van de afzender' }
        ],
        tags: ['educatie', 'onboarding', 'uitleg', 'template'],
        is_template: true
    },
    
    // Beslissingsondersteuning
    {
        categoryName: 'Beslissingsondersteuning',
        title: 'Beslissingsmatrix Template',
        description: 'Helpt bij het maken van weloverwogen beslissingen door voor- en nadelen af te wegen',
        content: `Beslissingsanalyse: {{decision_title}}

**Situatie:**
{{situation_description}}

**Opties:**

**Optie A: {{option_a_name}}**
✅ Voordelen:
- {{option_a_pro_1}}
- {{option_a_pro_2}}
- {{option_a_pro_3}}

❌ Nadelen:
- {{option_a_con_1}}
- {{option_a_con_2}}

**Optie B: {{option_b_name}}**
✅ Voordelen:
- {{option_b_pro_1}}
- {{option_b_pro_2}}
- {{option_b_pro_3}}

❌ Nadelen:
- {{option_b_con_1}}
- {{option_b_con_2}}

**Aanbeveling:**
{{recommendation}}

**Volgende stappen:**
{{next_steps}}`,
        variables: [
            { name: 'decision_title', type: 'string', default: '', description: 'Titel van de beslissing' },
            { name: 'situation_description', type: 'text', default: '', description: 'Beschrijving van de situatie' },
            { name: 'option_a_name', type: 'string', default: '', description: 'Naam van optie A' },
            { name: 'option_a_pro_1', type: 'string', default: '', description: 'Voordeel 1 van optie A' },
            { name: 'option_a_pro_2', type: 'string', default: '', description: 'Voordeel 2 van optie A' },
            { name: 'option_a_pro_3', type: 'string', default: '', description: 'Voordeel 3 van optie A' },
            { name: 'option_a_con_1', type: 'string', default: '', description: 'Nadeel 1 van optie A' },
            { name: 'option_a_con_2', type: 'string', default: '', description: 'Nadeel 2 van optie A' },
            { name: 'option_b_name', type: 'string', default: '', description: 'Naam van optie B' },
            { name: 'option_b_pro_1', type: 'string', default: '', description: 'Voordeel 1 van optie B' },
            { name: 'option_b_pro_2', type: 'string', default: '', description: 'Voordeel 2 van optie B' },
            { name: 'option_b_pro_3', type: 'string', default: '', description: 'Voordeel 3 van optie B' },
            { name: 'option_b_con_1', type: 'string', default: '', description: 'Nadeel 1 van optie B' },
            { name: 'option_b_con_2', type: 'string', default: '', description: 'Nadeel 2 van optie B' },
            { name: 'recommendation', type: 'text', default: '', description: 'Aanbeveling gebaseerd op analyse' },
            { name: 'next_steps', type: 'text', default: '', description: 'Concrete volgende stappen' }
        ],
        tags: ['beslissing', 'analyse', 'vergelijking', 'template'],
        is_template: true
    },
    
    // Creatieve Inspiratie
    {
        categoryName: 'Creatieve Inspiratie',
        title: 'Brainstorm Starter',
        description: 'Kickstart creatieve brainstormsessies met gerichte vragen en technieken',
        content: `🧠 Brainstorm Sessie: {{session_topic}}

**Doel:**
{{session_goal}}

**Warming-up vragen:**
1. Wat als {{constraint_removal}}?
2. Hoe zou {{inspiration_source}} dit aanpakken?
3. Wat is het gekste idee dat je kunt bedenken voor {{topic_area}}?

**Brainstorm technieken:**

📋 **6-3-5 Methode:**
- 6 mensen, 3 ideeën, 5 minuten
- Roteer en bouw voort op elkaars ideeën

🎯 **SCAMPER Techniek:**
- **S**ubstitueren: {{substitute_element}}
- **C**ombineren: {{combine_elements}}  
- **A**anpassen: {{adapt_from}}
- **M**odificeren: {{modify_aspect}}
- **P**ut to other use: {{other_use}}
- **E**limineren: {{eliminate_what}}
- **R**everse: {{reverse_what}}

**Evaluatie criteria:**
- {{criteria_1}}
- {{criteria_2}}
- {{criteria_3}}

**Actie items:**
- [ ] {{action_1}}
- [ ] {{action_2}}
- [ ] {{action_3}}`,
        variables: [
            { name: 'session_topic', type: 'string', default: '', description: 'Onderwerp van de brainstormsessie' },
            { name: 'session_goal', type: 'text', default: '', description: 'Doel van de sessie' },
            { name: 'constraint_removal', type: 'string', default: '', description: 'Welke beperking zou weggenomen kunnen worden' },
            { name: 'inspiration_source', type: 'string', default: '', description: 'Inspiratiebron (bedrijf, persoon, etc.)' },
            { name: 'topic_area', type: 'string', default: '', description: 'Specifiek gebied binnen het onderwerp' },
            { name: 'substitute_element', type: 'string', default: '', description: 'Element om te substitueren' },
            { name: 'combine_elements', type: 'string', default: '', description: 'Elementen om te combineren' },
            { name: 'adapt_from', type: 'string', default: '', description: 'Wat kan aangepast worden van...' },
            { name: 'modify_aspect', type: 'string', default: '', description: 'Welk aspect modificeren' },
            { name: 'other_use', type: 'string', default: '', description: 'Ander gebruik voor...' },
            { name: 'eliminate_what', type: 'string', default: '', description: 'Wat kan weggelaten worden' },
            { name: 'reverse_what', type: 'string', default: '', description: 'Wat kan omgekeerd worden' },
            { name: 'criteria_1', type: 'string', default: '', description: 'Eerste evaluatiecriterium' },
            { name: 'criteria_2', type: 'string', default: '', description: 'Tweede evaluatiecriterium' },
            { name: 'criteria_3', type: 'string', default: '', description: 'Derde evaluatiecriterium' },
            { name: 'action_1', type: 'string', default: '', description: 'Eerste actie item' },
            { name: 'action_2', type: 'string', default: '', description: 'Tweede actie item' },
            { name: 'action_3', type: 'string', default: '', description: 'Derde actie item' }
        ],
        tags: ['creativiteit', 'brainstorm', 'innovatie', 'template'],
        is_template: true
    },
    
    // Taakgericht  
    {
        categoryName: 'Taakgericht',
        title: 'Projectplan Template',
        description: 'Gestructureerde aanpak voor het plannen en uitvoeren van projecten',
        content: `📋 Project: {{project_name}}

**Project Overzicht:**
- **Doel:** {{project_goal}}
- **Deadline:** {{project_deadline}}
- **Budget:** {{project_budget}}
- **Projectleider:** {{project_manager}}

**Scope:**
{{project_scope}}

**Deliverables:**
1. {{deliverable_1}} - {{deadline_1}}
2. {{deliverable_2}} - {{deadline_2}}  
3. {{deliverable_3}} - {{deadline_3}}

**Team & Rollen:**
- {{role_1}}: {{person_1}}
- {{role_2}}: {{person_2}}
- {{role_3}}: {{person_3}}

**Risico's & Mitigatie:**
🔴 **Risico:** {{risk_1}}
   **Mitigatie:** {{mitigation_1}}

🟡 **Risico:** {{risk_2}}
   **Mitigatie:** {{mitigation_2}}

**Timeline:**
- **Week 1-2:** {{phase_1}}
- **Week 3-4:** {{phase_2}}
- **Week 5-6:** {{phase_3}}
- **Week 7-8:** {{phase_4}}

**Communicatie:**
- **Standup:** {{standup_frequency}}
- **Reviews:** {{review_frequency}}
- **Stakeholder updates:** {{stakeholder_updates}}

**Success Criteria:**
✅ {{success_criteria_1}}
✅ {{success_criteria_2}}
✅ {{success_criteria_3}}`,
        variables: [
            { name: 'project_name', type: 'string', default: '', description: 'Naam van het project' },
            { name: 'project_goal', type: 'text', default: '', description: 'Hoofddoel van het project' },
            { name: 'project_deadline', type: 'string', default: '', description: 'Einddatum van het project' },
            { name: 'project_budget', type: 'string', default: '', description: 'Budget voor het project' },
            { name: 'project_manager', type: 'string', default: '', description: 'Naam van de projectleider' },
            { name: 'project_scope', type: 'text', default: '', description: 'Scope van het project' },
            { name: 'deliverable_1', type: 'string', default: '', description: 'Eerste deliverable' },
            { name: 'deadline_1', type: 'string', default: '', description: 'Deadline voor eerste deliverable' },
            { name: 'deliverable_2', type: 'string', default: '', description: 'Tweede deliverable' },
            { name: 'deadline_2', type: 'string', default: '', description: 'Deadline voor tweede deliverable' },
            { name: 'deliverable_3', type: 'string', default: '', description: 'Derde deliverable' },
            { name: 'deadline_3', type: 'string', default: '', description: 'Deadline voor derde deliverable' },
            { name: 'role_1', type: 'string', default: '', description: 'Eerste rol in het team' },
            { name: 'person_1', type: 'string', default: '', description: 'Persoon voor eerste rol' },
            { name: 'role_2', type: 'string', default: '', description: 'Tweede rol in het team' },
            { name: 'person_2', type: 'string', default: '', description: 'Persoon voor tweede rol' },
            { name: 'role_3', type: 'string', default: '', description: 'Derde rol in het team' },
            { name: 'person_3', type: 'string', default: '', description: 'Persoon voor derde rol' },
            { name: 'risk_1', type: 'string', default: '', description: 'Eerste risico' },
            { name: 'mitigation_1', type: 'string', default: '', description: 'Mitigatie voor eerste risico' },
            { name: 'risk_2', type: 'string', default: '', description: 'Tweede risico' },
            { name: 'mitigation_2', type: 'string', default: '', description: 'Mitigatie voor tweede risico' },
            { name: 'phase_1', type: 'string', default: '', description: 'Eerste fase activiteiten' },
            { name: 'phase_2', type: 'string', default: '', description: 'Tweede fase activiteiten' },
            { name: 'phase_3', type: 'string', default: '', description: 'Derde fase activiteiten' },
            { name: 'phase_4', type: 'string', default: '', description: 'Vierde fase activiteiten' },
            { name: 'standup_frequency', type: 'string', default: 'Dagelijks', description: 'Frequentie van standups' },
            { name: 'review_frequency', type: 'string', default: 'Wekelijks', description: 'Frequentie van reviews' },
            { name: 'stakeholder_updates', type: 'string', default: 'Bi-weekly', description: 'Frequentie stakeholder updates' },
            { name: 'success_criteria_1', type: 'string', default: '', description: 'Eerste succes criterium' },
            { name: 'success_criteria_2', type: 'string', default: '', description: 'Tweede succes criterium' },
            { name: 'success_criteria_3', type: 'string', default: '', description: 'Derde succes criterium' }
        ],
        tags: ['project', 'planning', 'management', 'template'],
        is_template: true
    },
    
    // Communicatie
    {
        categoryName: 'Communicatie',
        title: 'Professionele E-mail Template',
        description: 'Template voor zakelijke e-mailcommunicatie',
        content: `Beste {{recipient_name}},

{{opening_line}}

{{main_message}}

{{call_to_action}}

{{closing_line}}

Met vriendelijke groet,
{{sender_name}}
{{sender_title}}
{{company_name}}

---
{{contact_details}}`,
        variables: [
            { name: 'recipient_name', type: 'string', default: '', description: 'Naam van de ontvanger' },
            { name: 'opening_line', type: 'string', default: '', description: 'Openingszin' },
            { name: 'main_message', type: 'text', default: '', description: 'Hoofdboodschap van de e-mail' },
            { name: 'call_to_action', type: 'string', default: '', description: 'Gewenste actie van de ontvanger' },
            { name: 'closing_line', type: 'string', default: '', description: 'Afsluitende zin' },
            { name: 'sender_name', type: 'string', default: '', description: 'Naam van de afzender' },
            { name: 'sender_title', type: 'string', default: '', description: 'Functie van de afzender' },
            { name: 'company_name', type: 'string', default: '', description: 'Naam van het bedrijf' },
            { name: 'contact_details', type: 'string', default: '', description: 'Contactgegevens' }
        ],
        tags: ['e-mail', 'communicatie', 'zakelijk', 'template'],
        is_template: true
    },
    
    // Analyse
    {
        categoryName: 'Analyse',
        title: 'Data Analyse Rapport',
        description: 'Gestructureerde template voor data-analyse rapporten',
        content: `📊 Data Analyse Rapport: {{report_title}}

**Executive Summary**
{{executive_summary}}

**1. Onderzoeksvraag**
{{research_question}}

**2. Methodologie**
- **Data bron:** {{data_source}}
- **Periode:** {{analysis_period}}
- **Sample grootte:** {{sample_size}}
- **Analysemethode:** {{analysis_method}}

**3. Key Findings**

**📈 Finding 1:** {{finding_1_title}}
{{finding_1_description}}
*Impact:* {{finding_1_impact}}

**📈 Finding 2:** {{finding_2_title}}
{{finding_2_description}}
*Impact:* {{finding_2_impact}}

**📈 Finding 3:** {{finding_3_title}}
{{finding_3_description}}
*Impact:* {{finding_3_impact}}

**4. Trends & Patronen**
{{trends_patterns}}

**5. Aanbevelingen**
1. **{{recommendation_1_title}}**
   {{recommendation_1_description}}
   *Prioriteit:* {{recommendation_1_priority}}

2. **{{recommendation_2_title}}**
   {{recommendation_2_description}}
   *Prioriteit:* {{recommendation_2_priority}}

3. **{{recommendation_3_title}}**
   {{recommendation_3_description}}
   *Prioriteit:* {{recommendation_3_priority}}

**6. Volgende Stappen**
{{next_steps}}

**7. Appendices**
{{appendices}}

---
*Rapport gegenereerd op {{report_date}} door {{analyst_name}}*`,
        variables: [
            { name: 'report_title', type: 'string', default: '', description: 'Titel van het rapport' },
            { name: 'executive_summary', type: 'text', default: '', description: 'Executive summary' },
            { name: 'research_question', type: 'text', default: '', description: 'Onderzoeksvraag' },
            { name: 'data_source', type: 'string', default: '', description: 'Bron van de data' },
            { name: 'analysis_period', type: 'string', default: '', description: 'Periode van analyse' },
            { name: 'sample_size', type: 'string', default: '', description: 'Grootte van de sample' },
            { name: 'analysis_method', type: 'string', default: '', description: 'Gebruikte analysemethode' },
            { name: 'finding_1_title', type: 'string', default: '', description: 'Titel van eerste bevinding' },
            { name: 'finding_1_description', type: 'text', default: '', description: 'Beschrijving eerste bevinding' },
            { name: 'finding_1_impact', type: 'string', default: '', description: 'Impact van eerste bevinding' },
            { name: 'finding_2_title', type: 'string', default: '', description: 'Titel van tweede bevinding' },
            { name: 'finding_2_description', type: 'text', default: '', description: 'Beschrijving tweede bevinding' },
            { name: 'finding_2_impact', type: 'string', default: '', description: 'Impact van tweede bevinding' },
            { name: 'finding_3_title', type: 'string', default: '', description: 'Titel van derde bevinding' },
            { name: 'finding_3_description', type: 'text', default: '', description: 'Beschrijving derde bevinding' },
            { name: 'finding_3_impact', type: 'string', default: '', description: 'Impact van derde bevinding' },
            { name: 'trends_patterns', type: 'text', default: '', description: 'Geobserveerde trends en patronen' },
            { name: 'recommendation_1_title', type: 'string', default: '', description: 'Titel eerste aanbeveling' },
            { name: 'recommendation_1_description', type: 'text', default: '', description: 'Beschrijving eerste aanbeveling' },
            { name: 'recommendation_1_priority', type: 'string', default: 'Medium', description: 'Prioriteit eerste aanbeveling' },
            { name: 'recommendation_2_title', type: 'string', default: '', description: 'Titel tweede aanbeveling' },
            { name: 'recommendation_2_description', type: 'text', default: '', description: 'Beschrijving tweede aanbeveling' },
            { name: 'recommendation_2_priority', type: 'string', default: 'Medium', description: 'Prioriteit tweede aanbeveling' },
            { name: 'recommendation_3_title', type: 'string', default: '', description: 'Titel derde aanbeveling' },
            { name: 'recommendation_3_description', type: 'text', default: '', description: 'Beschrijving derde aanbeveling' },
            { name: 'recommendation_3_priority', type: 'string', default: 'Medium', description: 'Prioriteit derde aanbeveling' },
            { name: 'next_steps', type: 'text', default: '', description: 'Volgende stappen' },
            { name: 'appendices', type: 'text', default: '', description: 'Bijlagen en aanvullende informatie' },
            { name: 'report_date', type: 'string', default: new Date().toLocaleDateString(), description: 'Datum van het rapport' },
            { name: 'analyst_name', type: 'string', default: '', description: 'Naam van de analist' }
        ],
        tags: ['analyse', 'rapport', 'data', 'template'],
        is_template: true
    }
];

async function seedExamplePrompts() {
    try {
        console.log('🔄 Starting example prompts seeding...');
        
        // Test database connection
        await sequelize.authenticate();
        console.log('✅ Database connection established.');
        
        // Get test company and user
        const testCompany = await Company.findOne({ where: { name: 'Test Company' } });
        const testUser = await User.findOne({ 
            where: { 
                email: 'admin@test.com',
                company_id: testCompany?.id 
            } 
        });
        
        if (!testCompany || !testUser) {
            console.log('⚠️  Test company or admin user not found. Please run the main seed script first.');
            return;
        }
        
        console.log(`✅ Using company: ${testCompany.name} (ID: ${testCompany.id})`);
        console.log(`✅ Using user: ${testUser.email} (ID: ${testUser.id})`);
        
        // Clear existing prompts for test company
        await Prompt.destroy({
            where: {
                company_id: testCompany.id,
                created_by: testUser.id
            }
        });
        console.log('🧹 Cleared existing example prompts.');
        
        let createdCount = 0;
        
        for (const promptData of examplePrompts) {
            // Find the category
            const category = await PromptCategory.findOne({
                where: { name: promptData.categoryName }
            });
            
            if (!category) {
                console.log(`⚠️  Category "${promptData.categoryName}" not found. Skipping prompt: ${promptData.title}`);
                continue;
            }
            
            // Create the prompt
            const prompt = await Prompt.create({
                title: promptData.title,
                description: promptData.description,
                content: promptData.content,
                variables: promptData.variables,
                category_id: category.id,
                company_id: testCompany.id,
                created_by: testUser.id,
                is_template: promptData.is_template,
                tags: promptData.tags,
                status: 'approved', // Auto-approve example prompts
                version: 1
            });
            
            // Create initial version
            await PromptVersion.create({
                prompt_id: prompt.id,
                version_number: 1,
                title: promptData.title,
                description: promptData.description,
                content: promptData.content,
                variables: promptData.variables,
                created_by: testUser.id,
                status: 'approved',
                is_current: true,
                change_notes: 'Initial example prompt'
            });
            
            console.log(`✅ Created prompt: "${promptData.title}" in category "${promptData.categoryName}"`);
            createdCount++;
        }
        
        console.log(`\n🎉 Successfully created ${createdCount} example prompts!`);
        
    } catch (error) {
        console.error('❌ Error seeding example prompts:', error);
        console.error('Stack trace:', error.stack);
    } finally {
        // Close database connection
        await sequelize.close();
        console.log('🔒 Database connection closed.');
    }
}

// Run the seeder if this file is executed directly
if (require.main === module) {
    seedExamplePrompts();
}

module.exports = seedExamplePrompts;