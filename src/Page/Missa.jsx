import React, { useState } from 'react';

const Missa = () => {
  const [language, setLanguage] = useState('EN'); // 'EN', 'LAT', 'IG'

  const content = {
    EN: {
      title: 'Order of Mass',
      introductory: {
        title: 'Introductory Rites',
        items: ['Entrance Antiphon', 'Penitential Act', 'Gloria in excelsis Deo', 'Collect'],
      },
      liturgyOfWord: {
        title: 'Liturgy of the Word',
        items: ['First Reading', 'Responsorial Psalm', 'Second Reading', 'Gospel Acclamation', 'Gospel', 'Homily', 'Profession of Faith', 'Universal Prayer'],
      },
      liturgyOfEucharist: {
        title: 'Liturgy of the Eucharist',
        items: ['Offertory', 'Prayer over the Offerings', 'Eucharistic Prayer', 'The Lord\'s Prayer', 'Sign of Peace', 'Lamb of God', 'Communion', 'Prayer after Communion'],
      },
      concluding: {
        title: 'Concluding Rites',
        items: ['Final Blessing', 'Dismissal'],
      },
    },
    LAT: {
      title: 'Ordo Missae',
      introductory: {
        title: 'Ritus Initiales',
        items: ['Antiphona ad introitum', 'Actus paenitentialis', 'Gloria in excelsis Deo', 'Collecta'],
      },
      liturgyOfWord: {
        title: 'Liturgia verbi',
        items: ['Lectio prima', 'Psalmus responsorius', 'Lectio secunda', 'Acclamatio ante Evangelium', 'Evangelium', 'Homilia', 'Professio fidei', 'Oratio universalis'],
      },
      liturgyOfEucharist: {
        title: 'Liturgia eucharistica',
        items: ['Offertorium', 'Oratio super oblata', 'Prex eucharistica', 'Oratio Dominica', 'Signum pacis', 'Agnus Dei', 'Communio', 'Post-communio'],
      },
      concluding: {
        title: 'Ritus Conclusionis',
        items: ['Benedictio finalis', 'Ite, missa est'],
      },
    },
    IG: {
      title: 'Usoro Emume Missa',
      introductory: {
        title: 'Mmalite Emume',
        items: ['Abụ Mmalite', 'Omume Nchegharị', 'Otito dịrị Chineke n\'elu kasị elu', 'Ekpere Mmalite'],
      },
      liturgyOfWord: {
        title: 'Litọjị nke Okwu Chineke',
        items: ['Ọgụgụ nke Mbụ', 'Abụ Azịza', 'Ọgụgụ nke Abụọ', 'Abụ ọma tupu Oziọma', 'Oziọma', 'Okwu Ozizi', 'Nkwupụta Okwukwe', 'Ekpere Obodo'],
      },
      liturgyOfEucharist: {
        title: 'Litọjị nke Oriri Nsọ',
        items: ['Nye Onyinye', 'Ekpere maka Onyinye', 'Ekpere Oriri Nsọ', 'Ekpere Nna Anyị nọ n\'eluigwe', 'Kele udo', 'Nwa Atụrụ nke Chineke', 'Oriri Nsọ', 'Ekpere Ekele mgbe Oriri Nsọ gasịrị'],
      },
      concluding: {
        title: 'Mmechi Emume',
        items: ['Ngọzi Ikpeazụ', 'Mgbasa'],
      },
    },
  };

  const currentContent = content[language];

  const renderSection = (section) => (
    <div key={section.title} className="mb-8">
      <h3 className="text-xl font-serif text-[#8b4513] border-b border-[#e6d5c3] dark:border-[#2a1b12] pb-2 mb-4 transition-colors">{section.title}</h3>
      <ul className="space-y-2 list-disc list-inside text-gray-700 dark:text-gray-400">
        {section.items.map(item => <li key={item} className="text-sm">{item}</li>)}
      </ul>
    </div>
  );

  return (
    <div className="animate-fadeIn transition-colors duration-500">
      <h2 className="text-2xl font-serif text-[#8b4513] dark:text-[#d2b48c] mb-6">{currentContent.title}</h2>
      <div className="bg-white/80 dark:bg-[#111111]/80 backdrop-blur-md border border-[#e6d5c3] dark:border-[#2a1b12] p-6 md:p-8 rounded-xl shadow-xl max-w-4xl transition-colors">
        
        {/* Language Switcher */}
        <div className="flex justify-center gap-2 mb-8 p-2 bg-gray-100 dark:bg-[#161616] border border-[#e6d5c3] dark:border-[#2a1b12] rounded-lg max-w-xs mx-auto transition-colors">
          {Object.keys(content).map(lang => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`w-full py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-all ${language === lang ? 'bg-[#8b4513] text-white shadow-lg' : 'text-gray-600 dark:text-gray-500 hover:bg-white dark:hover:bg-[#2a1b12]'}`}
            >
              {lang}
            </button>
          ))}
        </div>

        {renderSection(currentContent.introductory)}
        {renderSection(currentContent.liturgyOfWord)}
        {renderSection(currentContent.liturgyOfEucharist)}
        {renderSection(currentContent.concluding)}

      </div>
    </div>
  );
};

export default Missa;