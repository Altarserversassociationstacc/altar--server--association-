import React, { useState } from 'react';

const Rosary = () => {
  const [language, setLanguage] = useState('EN'); // 'EN', 'IG'

  const content = {
    EN: {
      title: 'The Holy Rosary',
      prayers: [
        { title: "Sign of the Cross", text: "In the name of the Father, and of the Son, and of the Holy Spirit. Amen." },
        { title: "The Apostles' Creed", text: "I believe in God, the Father Almighty, Creator of Heaven and earth; and in Jesus Christ, His only Son, Our Lord, Who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died, and was buried. He descended into Hell; the third day He arose again from the dead; He ascended into Heaven, and sitteth at the right hand of God, the Father Almighty; from thence He shall come to judge the living and the dead. I believe in the Holy Spirit, the holy Catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen." },
        { title: "Our Father", text: "Our Father, Who art in heaven, hallowed be Thy name; Thy kingdom come; Thy will be done on earth as it is in heaven. Give us this day our daily bread; and forgive us our trespasses as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen." },
        { title: "Hail Mary", text: "Hail, Mary, full of grace, the Lord is with thee. Blessed art thou amongst women and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen." },
        { title: "Glory Be", text: "Glory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen." },
        { title: "Fatima Prayer", text: "O my Jesus, forgive us our sins, save us from the fires of hell, lead all souls to Heaven, especially those most in need of Thy mercy. Amen." },
        { title: "Hail Holy Queen", text: "Hail, Holy Queen, Mother of Mercy, our life, our sweetness and our hope. To thee do we cry, poor banished children of Eve: to thee do we send up our sighs, mourning and weeping in this valley of tears. Turn then, most gracious Advocate, thine eyes of mercy toward us, and after this our exile, show unto us the blessed fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary! Pray for us, O Holy Mother of God, that we may be made worthy of the promises of Christ. Amen." }
      ],
      mysteryCategories: [
        {
          title: 'The Joyful Mysteries',
          day: '(Mondays and Saturdays)',
          mysteries: [
            'The Annunciation of the Lord to Mary',
            'The Visitation of Mary to Elizabeth',
            'The Nativity of the Lord Jesus Christ',
            'The Presentation of the Lord',
            'The Finding of Jesus in the Temple',
          ],
        },
        {
          title: 'The Luminous Mysteries',
          day: '(Thursdays)',
          mysteries: [
            'The Baptism of Christ in the Jordan',
            'The Wedding Feast at Cana',
            'Jesus\' Proclamation of the Coming of the Kingdom of God',
            'The Transfiguration',
            'The Institution of the Eucharist',
          ],
        },
        {
          title: 'The Sorrowful Mysteries',
          day: '(Tuesdays and Fridays)',
          mysteries: [
            'The Agony in the Garden',
            'The Scourging at the Pillar',
            'The Crowning with Thorns',
            'The Carrying of the Cross',
            'The Crucifixion and Death of our Lord',
          ],
        },
        {
          title: 'The Glorious Mysteries',
          day: '(Wednesdays and Sundays)',
          mysteries: [
            'The Resurrection of Jesus Christ',
            'The Ascension of Jesus to Heaven',
            'The Descent of the Holy Ghost',
            'The Assumption of the Blessed Virgin Mary into Heaven',
            'The Coronation of the Blessed Virgin Mary, Queen of Heaven and Earth',
          ],
        }
      ]
    },
    IG: {
      title: 'Rọzarị Nsọ',
      prayers: [
        { title: "Iba Ama Obe (Sign of the Cross)", text: "N'aha Nna, na Nwa, na Mụọ Nsọ. Amen." },
        { title: "Ekweere M (Apostles' Creed)", text: "Ekwere m na Chineke, bụ Nna nwe ike nile, Onye kere eluigwe na ụwa; na nwa ya, bụ Jizọs Kraịst, Onyenwe anyị, onye a tụụrụ ime site na Mụọ Nsọ, onye a mụrụ site na Virgin Maria, onye tara ahụhụ n'okpuru Pontius Pilate, onye a kpọgidere n'obe, nwụọ, ma lie ya. Ọ rịdatara na Hel; n'ụbọchị nke atọ O si na ndị nwụrụ anwụ bilie; Ọ rịgoro n'eluigwe, ma nọdụ n'aka nri Chineke, bụ Nna nwe ike nile; site n'ebe ahụ Ọ ga-abịa ikpe ndị dị ndụ na ndị nwụrụ anwụ. Ekwere m na Mụọ Nsọ, na Nzukọ Nsọ Katọlik, na mmekọrịta nke ndị Nsọ, na mgbaghara nke mmehie, na mbilite n'ọnwụ nke anụ ahụ, na ndụ ebighị ebi. Amen." },
        { title: "Nna Anyị (Our Father)", text: "Nna anyị nọ n'eluigwe, ka aha Gị dị nsọ; ka alaeze Gị bịa; ka uche Gị mezuo n'ụwa dịka o si eme n'eluigwe. Nye anyị nri anyị kwa ụbọchị taa; gbaghara anyị mmehie anyị dịka anyị si agbaghara ndị mehiere anyị; edubala anyị n'ọnwụnwa, kama napụta anyị n'ihe ọjọọ. Amen." },
        { title: "Ekele Maria (Hail Mary)", text: "Ekele Maria, jupụta na grasịa, Oseburụwa nọnyere gị. Ị gọziri agọzi n'ime ụmụ nwaanyị nịịle, a gọzikwara agọzi bụ nwa afọ gị bụ Jizọs. Nsọ Maria, Nne nke Chineke, kpeere anyị bụ ndị mmehie ekpere, ugbua na n'oge ọnwụ anyị. Amen." },
        { title: "Otito Dịrị Nna (Glory Be)", text: "Otito dịrị Nna, na Nwa, na Mụọ Nsọ. Dịka o siri dị na mbido, na ugbua, na mgbe ebi ebi, ruo mgbe ebighị ebi. Amen." },
        { title: "Ekpere Fatima (Fatima Prayer)", text: "O Jizọs m, gbaghara anyị mmehie anyị, zọpụta anyị n'ọkụ ala mụọ, duru mkpụrụobi nịịle gaa n'eluigwe, kachasị ndị nke ebere gị kacha na-akpa mkpa. Amen." },
        { title: "Ekele Ezenwaanyị Nsọ (Hail Holy Queen)", text: "Ekele, Ezenwaanyị Nsọ, Nne nke Ebere, ndụ anyị, ịdị ụtọ anyị na olileanya anyị, ekele. Gị ka anyị na-akpọku, anyị ụmụ Iv a chụgara achụga. Gị ka anyị na-esetịpụrụ ude anyị, na-eru uju ma na-akwa ákwá n'ọzara anya mmiri a. Biko, Onye na-ekwuchitere anyị, tụgharịa anya ebere gị n'ebe anyị nọ; ma mgbe nchụga a gasịrị, gosi anyị Jizọs, bụ nwa afọ gị a gọziri agọzi. O Onye obiọma, O Onye hụrụ anyị n'anya, O nwa agbọghọ na-atọ ụtọ, bụ Maria! Kpeere anyị ekpere, O Nne Nsọ nke Chineke, ka anyị wee ruo eruo inweta ihe Kraịst kwere na nkwa. Amen." }
      ],
      mysteryCategories: [
        {
          title: 'Ihe Omimi Nke Aṅụrị (Joyful)',
          day: '(Mọnde na Satọde)',
          mysteries: [
            'Mụọ Nsọ siri n\'igwe bịa kọọrọ Maria na ọ ga-amụta nwa',
            'Maria jere ije leta Elizabet nwanne ya',
            'Ọmụmụ Jizọs Kraịst n\'ụlọ anụ dị na Betlehem',
            'Maria na Josef chụrụ aja nwa ha n\'ụlọ nsọ',
            'Ịchọta Jizọs n\'ụlọ nsọ ka ọ na-akụziri ndị nkụzi ihe',
          ],
        },
        {
          title: 'Ihe Omimi Nke Ìhè (Luminous)',
          day: '(Tọzde)',
          mysteries: [
            'Baptizim nke Jizọs n\'osimiri Jọdan',
            'Ọrụ ebube Jizọs rụrụ n\'oriri ọlụlụ di na nwunye na Kena',
            'Nkwusa nke Alaeze Chineke na ịkpọ òkù maka nchegharị',
            'Nnwogha nke Jizọs n\'elu ugwu',
            'Ntọala nke Oriri Nsọ',
          ],
        },
        {
          title: 'Ihe Omimi Nke Ihe Ụfụ (Sorrowful)',
          day: '(Tuzde na Fraịde)',
          mysteries: [
            'Ahụhụ Jizọs n\'ubi Getsemeni',
            'Ipi Jizọs ụtarị n\'ogidi',
            'Ichi Jizọs okpueze ogwu',
            'Ibu obe nke Jizọs',
            'Ịkpọgide Jizọs n\'obe na ọnwụ ya',
          ],
        },
        {
          title: 'Ihe Omimi Nke Ebube (Glorious)',
          day: '(Wenezde na Sọnde)',
          mysteries: [
            'Mbilite n\'ọnwụ nke Jizọs Kraịst',
            'Ịrịgoro Jizọs n\'eluigwe',
            'Ọdịda nke Mụọ Nsọ n\'ahụ ndịozi',
            'Ịrịgoro nke Nsọ Maria n\'eluigwe n\'ahụ na mụọ',
            'Ichi Nsọ Maria okpueze n\'eluigwe',
          ],
        }
      ]
    },
  };

  const currentContent = content[language];

  return (
    <div className="animate-fadeIn">
      <h2 className="text-2xl font-serif text-[#d2b48c] mb-6">{currentContent.title}</h2>
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-xl shadow-2xl max-w-4xl">
        
        {/* Language Switcher */}
        <div className="flex justify-center gap-2 mb-8 p-2 bg-white/5 border border-white/10 rounded-lg max-w-xs mx-auto">
          {Object.keys(content).map(lang => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`w-full py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-all ${language === lang ? 'bg-blue-800 text-white shadow-lg' : 'text-gray-500 hover:bg-[#2a1b12]'}`}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Render Prayers */}
        <div className="space-y-6 text-gray-300 text-sm leading-loose border-b border-white/5 pb-10">
          <h3 className="text-xl font-serif text-[#8b4513] mb-6 border-b border-white/5 inline-block pb-2">The Prayers</h3>
          {currentContent.prayers.map((prayer, index) => (
            <div key={index} className="bg-white/5 p-4 rounded-lg border border-white/10">
              <h4 className="font-bold text-[#d2b48c] mb-2 uppercase tracking-widest text-[10px]">{prayer.title}</h4>
              <p className={index === 0 ? "italic text-gray-400" : ""}>{prayer.text}</p>
            </div>
          ))}
        </div>

        {/* Render Mystery Categories in a Grid */}
        <div className="mt-10 animate-fadeIn">
          <h3 className="text-xl font-serif text-[#8b4513] mb-6 border-b border-white/5 inline-block pb-2">The Mysteries</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentContent.mysteryCategories.map((category, idx) => (
              <div key={idx} className="bg-white/5 p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all">
                <h4 className="text-lg font-serif text-[#d2b48c]">{category.title}</h4>
                <p className="text-xs text-gray-500 mb-4">{category.day}</p>
                <ol className="space-y-3 list-decimal list-inside text-gray-400">
                  {category.mysteries.map((mystery, mIdx) => (
                    <li key={mIdx} className="text-sm">{mystery}</li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Rosary;