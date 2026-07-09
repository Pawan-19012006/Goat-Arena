export interface DebatePoint {
  counterpoint: string;
  supportingFact: string;
}

export interface EntityDebateProfile {
  [category: string]: DebatePoint;
}

export interface DebateDatabase {
  [entity: string]: EntityDebateProfile;
}

export const DEBATE_DATABASE: DebateDatabase = {
  ronaldo: {
    goals: {
      counterpoint: "Goals are the ultimate objective metric in football, and anyone criticizing his numbers is just ignoring history.",
      supportingFact: "He has scored over 890 career goals and remains the all-time top scorer in men's international football with over 130 goals."
    },
    awards: {
      counterpoint: "Individual voting awards are subjective media popularity contests. Real legacy is written by objective performance on the pitch.",
      supportingFact: "He won 5 Ballon d'Or awards across multiple leagues and holds the record for most nominations in football history."
    },
    world_cup: {
      counterpoint: "A seven-game tournament with high penalty volumes cannot define a twenty-year career of absolute dominance.",
      supportingFact: "He is the only player in history to score in five consecutive World Cup tournaments and led Portugal to their first-ever European Championship."
    },
    champions_league: {
      counterpoint: "The Champions League is the highest tactical standard of club football, and he is its undisputed King.",
      supportingFact: "He won 5 UCL trophies, is the all-time top scorer with 140 goals, and holds the record for most goals in a single campaign with 17."
    },
    dribbling: {
      counterpoint: "Dribbling is purely aesthetic. Efficient off-ball movement, elite positioning, and goal-scoring win matches, not showboating.",
      supportingFact: "He completed over 1,000 dribbles early in his career at Manchester United and Madrid before optimizing into the ultimate box scorer."
    },
    playmaking: {
      counterpoint: "Playmaking isn't just dropping deep. Creating space, drawing defenders, and decisive final actions are what decide matches.",
      supportingFact: "He has registered over 250 career assists, proving he is a highly effective team player as well as a lethal finisher."
    },
    passing: {
      counterpoint: "Passing sideways in midfield is easy. Crucial forward passing and decisive final balls are the true metrics of success.",
      supportingFact: "His key passes in the final third led directly to 5 Champions League trophies and domestic titles in three leagues."
    },
    assists: {
      counterpoint: "Assists depend heavily on teammates finishing. Objective goal output is the only true self-reliant metric.",
      supportingFact: "He recorded more Champions League assists than any other player in history, with 42 assists."
    },
    leadership: {
      counterpoint: "Leadership is about setting high standards of work ethic and pushing the team, not just smiling for cameras.",
      supportingFact: "He captained Portugal to Euro 2016 and Nations League 2019 glory through sheer motivation and example."
    },
    longevity: {
      counterpoint: "Longevity is the ultimate indicator of physical discipline and elite professionalism.",
      supportingFact: "At age 39, he won the Saudi Pro League Golden Boot with 35 goals in a single season and continues to lead his country."
    },
    league_adaptability: {
      counterpoint: "Anyone can succeed in a single protected system. True greatness is proving yourself across different styles and cultures.",
      supportingFact: "He won domestic titles, golden boots, and Champions Leagues in the Premier League, La Liga, and Serie A."
    },
    clutch_performances: {
      counterpoint: "When the pressure is highest, he is the most reliable player in the history of the sport.",
      supportingFact: "He has scored 67 Champions League knockout stage goals, far exceeding any other footballer."
    },
    international_performance: {
      counterpoint: "International football is about carrying your nation, and he has done that for Portugal for over two decades.",
      supportingFact: "He holds the record for the most goals in international football history, with 130+ goals."
    },
    trophies: {
      counterpoint: "Trophies are won by teams, but he has been the primary engine for every single major trophy he claimed.",
      supportingFact: "He won 33 major team trophies, including 5 Champions Leagues and the UEFA European Championship."
    },
    records: {
      counterpoint: "Critics try to downplay individual records, but records are the permanent proof of historical superiority.",
      supportingFact: "He holds the all-time scoring record in both the UEFA Champions League (140) and international football (130+)."
    },
    consistency: {
      counterpoint: "A couple of good seasons is easy. Maintaining elite status for twenty years is nearly impossible.",
      supportingFact: "He scored 50+ goals per season for six consecutive years at Real Madrid, showing unmatched consistency."
    },
    team_dependency: {
      counterpoint: "He has succeeded under completely different managers, systems, and teammates across three countries.",
      supportingFact: "He won Ballon d'Ors and UCL trophies under Sir Alex Ferguson, Carlo Ancelotti, and Zinedine Zidane."
    },
    physicality: {
      counterpoint: "Football is an athletic sport, and he is the absolute peak specimen of physical development.",
      supportingFact: "His vertical jump and heading statistics are the highest recorded in professional football history."
    },
    mentality: {
      counterpoint: "His elite mentality and work ethic are what enabled him to rise to the top and stay there.",
      supportingFact: "His absolute dedication to recovery and training is legendary, inspiring teammates and fans worldwide."
    },
    peak_performance: {
      counterpoint: "His peak years represented the most dominant offensive seasons the world of football has ever witnessed.",
      supportingFact: "During the 2011-12 season, he scored 60 goals in all competitions, leading Madrid to a historic 100-point La Liga title."
    }
  },
  messi: {
    goals: {
      counterpoint: "Goals are only one part of his game. He scores at a historic rate while running the entire playmaking of his team.",
      supportingFact: "He holds the record for the most goals in a single calendar year (91 goals in 2012) and has won 6 European Golden Shoes."
    },
    awards: {
      counterpoint: "If awards are subjective, winning them a record number of times shows the global consensus of his genius.",
      supportingFact: "He has won a record 8 Ballon d'Or awards and remains the most decorated individual player in football history."
    },
    world_cup: {
      counterpoint: "The World Cup is the pinnacle of the sport, and he completed football by winning it as its best player.",
      supportingFact: "He won the 2022 FIFA World Cup, claiming the Golden Ball as the tournament's best player after scoring in every knockout round."
    },
    champions_league: {
      counterpoint: "He has dominated the Champions League with a style of play that combines lethal finishing with elite creation.",
      supportingFact: "He has won 4 Champions League titles and scored 129 UCL goals at a superior goals-per-game ratio to his rivals."
    },
    dribbling: {
      counterpoint: "Dribbling is about progression and threat, and his close control is the most effective in football history.",
      supportingFact: "He holds the record for the most completed dribbles in World Cup and Champions League history, consistently unlocking deep blocks."
    },
    playmaking: {
      counterpoint: "He is the ultimate hybrid player—the best goalscorer and the best playmaker combined in one package.",
      supportingFact: "He has won the IFFHS World's Best Playmaker award 5 times, a record in modern football."
    },
    passing: {
      counterpoint: "His vision and passing range allow him to unlock defenses from deep midfield, changing the entire game state.",
      supportingFact: "He has recorded the most through-balls and key passes in elite European leagues over the last 15 years."
    },
    assists: {
      counterpoint: "Assists are a direct measure of creativity, and he has set the absolute standard for goal creation.",
      supportingFact: "He holds the all-time record for the most assists in football history, with over 360 career assists."
    },
    leadership: {
      counterpoint: "Leadership isn't about screaming; it's about leading your nation through performance on the biggest stages.",
      supportingFact: "He captained Argentina to a Copa América title and a World Cup trophy, leading by example in every match."
    },
    longevity: {
      counterpoint: "His ability to transition from a winger to a playmaker shows his unique football intelligence over time.",
      supportingFact: "At age 35, he won the World Cup Golden Ball, and at age 36, he collected his eighth Ballon d'Or."
    },
    league_adaptability: {
      counterpoint: "Moving clubs constantly is not a metric of success. Maintaining a historic standard of play at one club is far harder.",
      supportingFact: "He dominated the highest level of European football at Barcelona before winning Ligue 1 and lifting trophies in North America."
    },
    clutch_performances: {
      counterpoint: "In final matches, he has consistently delivered goals, assists, and trophies when the pressure is intense.",
      supportingFact: "He has scored in multiple Champions League finals, Copa América finals, and scored twice in the World Cup final."
    },
    international_performance: {
      counterpoint: "He answered all international critics by winning consecutive major tournaments with Argentina.",
      supportingFact: "He led Argentina to the Copa América (2021), Finalissima (2022), and FIFA World Cup (2022) victories."
    },
    trophies: {
      counterpoint: "Trophies are the ultimate measure of competitive success, and his cabinet is the largest in history.",
      supportingFact: "He has won 44 team trophies, making him the most decorated footballer in the history of the sport."
    },
    records: {
      counterpoint: "His records cover goals, assists, dribbles, and trophies, proving his absolute, well-rounded dominance.",
      supportingFact: "He holds the record for most Ballon d'Ors (8), most goals in a single club career, and most trophies (44)."
    },
    consistency: {
      counterpoint: "His level has never dropped, remaining the highest-rated player in the world for over fifteen years.",
      supportingFact: "He registered 40+ goals in 10 consecutive seasons at Barcelona, an unparalleled stretch of consistency."
    },
    team_dependency: {
      counterpoint: "He has won trophies at Barcelona, PSG, Inter Miami, and captained Argentina to three international titles.",
      supportingFact: "He adapted to three different leagues and carried a rebuilding Argentina side to world dominance."
    },
    physicality: {
      counterpoint: "Physicality is about balance and low center of gravity. His strength allows him to ride tackles that fell others.",
      supportingFact: "Despite his height, he holds the best record for successfully staying on his feet under heavy defensive contact."
    },
    mentality: {
      counterpoint: "His calm, focused mentality under extreme pressure is what makes him the ultimate big-game decisive player.",
      supportingFact: "He shouldered the absolute pressure of an entire nation to deliver the World Cup, scoring in every single round."
    },
    peak_performance: {
      counterpoint: "His peak year is statistically the most dominant individual season in the history of team sports.",
      supportingFact: "He scored 73 goals and provided 29 assists in the 2011-12 season, representing a historic 102 goal involvements."
    }
  },
  mbappe: {
    goals: {
      counterpoint: "He is a natural-born finisher who scores in every key match at a historic rate.",
      supportingFact: "He is PSG's all-time top scorer with over 250 goals and won the Ligue 1 Golden Boot 6 consecutive times."
    },
    awards: {
      counterpoint: "Individual awards will come with time; his objective performances on the world stage speak for themselves.",
      supportingFact: "He won the Golden Boot at the 2022 World Cup and has consistently featured in the FIFPro World XI."
    },
    world_cup: {
      counterpoint: "He is already a World Cup legend, performing at a level that rivals Pelé in tournament history.",
      supportingFact: "He won the World Cup at age 19 in 2018 and scored a historic hat-trick in the 2022 World Cup Final."
    },
    champions_league: {
      counterpoint: "He has lit up the Champions League, scoring away at Barcelona, Bayern Munich, and Real Madrid.",
      supportingFact: "He has scored over 48 Champions League goals, making him one of the youngest to reach that milestone."
    },
    dribbling: {
      counterpoint: "His speed and directness make his dribbling the most dangerous transitional threat in modern football.",
      supportingFact: "His rapid acceleration and dribbling statistics show he is nearly impossible to stop in 1v1 situations."
    },
    playmaking: {
      counterpoint: "He is not just a goalscorer; his ability to create space and cut inside creates massive chances for his teammates.",
      supportingFact: "He has registered over 120 career assists, showing elite creative capability alongside his scoring."
    },
    passing: {
      counterpoint: "His final-third passes are designed to lock in goals, not just pad stats in the midfield.",
      supportingFact: "His quick link-up play in the final third has unlocked the best defenses in Ligue 1 and Europe."
    },
    assists: {
      counterpoint: "His assist numbers are elite for a primary forward, showing his complete versatility.",
      supportingFact: "He finished as Ligue 1's top assist provider alongside being its top scorer in the 2021-22 season."
    },
    leadership: {
      counterpoint: "He is the face of French football, taking on massive pressure and delivering when it matters most.",
      supportingFact: "He was named captain of the France National Team at age 24, leading them through European qualification."
    },
    longevity: {
      counterpoint: "He has been at the absolute peak of world football since he was a teenager at Monaco.",
      supportingFact: "He has maintained a 30+ goal-scoring average for 7 consecutive seasons at the highest level."
    },
    league_adaptability: {
      counterpoint: "He dominated France, won the World Cup, and moved to Real Madrid to conquer Spanish football.",
      supportingFact: "He has won Ligue 1 titles with Monaco and PSG, and completed his dream transfer to Real Madrid in 2024."
    },
    clutch_performances: {
      counterpoint: "He is the definition of a big-game player, delivering when the absolute pressure is on.",
      supportingFact: "He is the all-time top scorer in World Cup final matches, with 4 goals across two finals."
    },
    international_performance: {
      counterpoint: "His international record at his age is unmatched in modern football history.",
      supportingFact: "He has scored 46+ goals for France and won the FIFA World Cup and the UEFA Nations League."
    },
    trophies: {
      counterpoint: "He has won major trophies at both club and international level since the start of his career.",
      supportingFact: "His trophy cabinet includes 7 Ligue 1 titles, a FIFA World Cup, and a UEFA Nations League."
    },
    records: {
      counterpoint: "He is on track to break every major goalscoring record in French and international history.",
      supportingFact: "He is the youngest player to score 30 Champions League goals and the top scorer in World Cup final history."
    },
    consistency: {
      counterpoint: "His output is elite year after year, with zero drop-offs in performance.",
      supportingFact: "He has scored 40+ goals for club and country in 4 consecutive seasons."
    },
    team_dependency: {
      counterpoint: "He carried PSG's attack and has been the main engine for France in two World Cup finals.",
      supportingFact: "He led PSG to a Champions League final and France to a World Cup trophy as the primary threat."
    },
    physicality: {
      counterpoint: "His pace is the most devastating physical attribute in modern football.",
      supportingFact: "He has clocked top speeds of over 38 km/h, making him the fastest elite forward in the world."
    },
    mentality: {
      counterpoint: "His confidence and mental strength allow him to step up on the biggest stage without fear.",
      supportingFact: "He scored three penalties under pressure in the 2022 World Cup Final, showing nerves of steel."
    },
    peak_performance: {
      counterpoint: "His peak seasons represent absolute elite levels of goal scoring and playmaking.",
      supportingFact: "In the 2021-22 season, he recorded 39 goals and 26 assists in all competitions for PSG."
    }
  },
  haaland: {
    goals: {
      counterpoint: "He is a goals machine, and goalscoring is the primary job of a central striker.",
      supportingFact: "He broke the Premier League single-season scoring record with 36 goals in his debut campaign."
    },
    awards: {
      counterpoint: "He won major individual awards in the toughest league in the world in his first year.",
      supportingFact: "He won the Gerd Müller Trophy, the Premier League Player of the Season, and finished runner-up in the Ballon d'Or."
    },
    world_cup: {
      counterpoint: "You cannot blame a player for their country's football size. He dominates every tournament he plays.",
      supportingFact: "He has scored over 30 goals for Norway at a historic international goals-per-game ratio."
    },
    champions_league: {
      counterpoint: "He is the most efficient scorer in Champions League history, scoring in almost every appearance.",
      supportingFact: "He is the fastest player to reach 40 Champions League goals, doing so in just 35 matches."
    },
    dribbling: {
      counterpoint: "Strikers don't need to dribble past five players. Efficient box movement and finishing are what win games.",
      supportingFact: "His off-ball movement and acceleration allow him to break defensive lines without needing to showboat."
    },
    playmaking: {
      counterpoint: "His presence in the box draws multiple defenders, creating space and chances for the rest of his team.",
      supportingFact: "His runs off the ball directly enabled Manchester City to win a historic treble in 2023."
    },
    passing: {
      counterpoint: "A striker's job is to finish plays, not build them in the midfield.",
      supportingFact: "His link-up play and layout passes in the final third are highly effective for Pep Guardiola's system."
    },
    assists: {
      counterpoint: "He assists by pulling defenders away, but still records a solid number of direct setups.",
      supportingFact: "He registered 8 assists in his record-breaking Premier League debut season."
    },
    leadership: {
      counterpoint: "He leads through intimidation of defenders and an absolute, unyielding focus on winning.",
      supportingFact: "He spearheads the attack of the best club team in world football, setting the offensive tone."
    },
    longevity: {
      counterpoint: "He has dominated every single league he has set foot in since he was a teenager.",
      supportingFact: "He has won golden boots in Austria, Germany, and England before the age of 24."
    },
    league_adaptability: {
      counterpoint: "He proved he could adapt instantly to the most physical league in the world, breaking its record on year one.",
      supportingFact: "He scored 86 goals in 89 games for Dortmund before moving to Manchester City and winning the treble."
    },
    clutch_performances: {
      counterpoint: "His goals are what put City in position to win their first-ever Champions League title.",
      supportingFact: "He scored 12 goals in the 2022-23 UCL campaign, leading the tournament as City secured the trophy."
    },
    international_performance: {
      counterpoint: "He has carried Norway on his back, scoring at a rate that rivals historic legends.",
      supportingFact: "His goals-per-game ratio for Norway is near 1.0, an elite standard in international football."
    },
    trophies: {
      counterpoint: "He won the most difficult trophies in club football in his very first season in England.",
      supportingFact: "He won the Continental Treble (Premier League, FA Cup, and Champions League) with Manchester City in 2023."
    },
    records: {
      counterpoint: "His goalscoring records at his age are the fastest in the history of elite European football.",
      supportingFact: "He holds the record for fastest to 10, 20, 30, and 40 Champions League goals."
    },
    consistency: {
      counterpoint: "He has maintained a goal-per-game average across Salzburg, Dortmund, and Manchester City.",
      supportingFact: "He has scored over 250 career goals before turning 24, showing unmatched scoring consistency."
    },
    team_dependency: {
      counterpoint: "He has scored at a historic rate in completely different setups and teams.",
      supportingFact: "He scored 29 goals for Salzburg, 86 for Dortmund, and 90+ for Manchester City."
    },
    physicality: {
      counterpoint: "He is a physical powerhouse, combining elite height, strength, and raw speed.",
      supportingFact: "His speed has been clocked at 36 km/h, making him a rare combination of size and pace."
    },
    mentality: {
      counterpoint: "He has a single-minded focus on goalscoring, making him a psychological nightmare for defenders.",
      supportingFact: "His laser focus in front of goal allows him to convert chances with maximum efficiency."
    },
    peak_performance: {
      counterpoint: "His debut season in England is widely regarded as the best rookie campaign in Premier League history.",
      supportingFact: "He scored 52 goals in 53 appearances in all competitions during the 2022-23 season."
    }
  },
  argentina: {
    goals: {
      counterpoint: "Our attack is balanced and clinical, capable of unlocking any defense in world football.",
      supportingFact: "We scored 15 goals in the 2022 World Cup, including 3 in a historic final against France."
    },
    awards: {
      counterpoint: "We hold the most individual tournament awards in recent international history.",
      supportingFact: "Our squad swept the 2022 World Cup awards: Golden Ball (Messi), Golden Glove (Martínez), and Young Player (Enzo)."
    },
    world_cup: {
      counterpoint: "The World Cup is the ultimate tournament, and we are the reigning champions of the world.",
      supportingFact: "We won the 2022 FIFA World Cup, claiming our third star in the greatest final ever played."
    },
    champions_league: {
      counterpoint: "Our players are the core engines of the biggest Champions League winning clubs in Europe.",
      supportingFact: "Our squad features players who have won Champions Leagues with Real Madrid, Atlético, and Manchester City."
    },
    dribbling: {
      counterpoint: "We possess the technical dribbling ability to retain possession under the heaviest press.",
      supportingFact: "Led by Lionel Messi and Di María, we have historically dominated progressive dribbles in tournaments."
    },
    playmaking: {
      counterpoint: "Our midfield combination controls matches through elite passing and chance creation.",
      supportingFact: "Our midfield of De Paul, Mac Allister, and Enzo Fernández dominated the Copa América and World Cup campaigns."
    },
    passing: {
      counterpoint: "Our passing accuracy in possession is designed to dictate the tempo of matches.",
      supportingFact: "We maintained over 88% passing accuracy throughout the knockout stages of the 2022 World Cup."
    },
    assists: {
      counterpoint: "Our team play is highly collective, generating assists from every area of the pitch.",
      supportingFact: "We recorded 10 assists during our World Cup winning campaign in Qatar."
    },
    leadership: {
      counterpoint: "Our leadership is forged in tactical discipline and an absolute loyalty to the national shirt.",
      supportingFact: "Lionel Scaloni led the team from a drought to three consecutive major international titles."
    },
    longevity: {
      counterpoint: "We have maintained an elite generation of players performing at the top level for years.",
      supportingFact: "Messi and Di María completed a 15-year international journey from Olympic Gold (2008) to World Cup glory (2022)."
    },
    league_adaptability: {
      counterpoint: "Our players are stars in the Premier League, La Liga, Serie A, and Primeira Liga.",
      supportingFact: "Our World Cup winning squad features starters from Manchester City, Chelsea, Atlético Madrid, and Inter Milan."
    },
    clutch_performances: {
      counterpoint: "When the match goes to penalties or extra time, we possess the strongest nerves in football.",
      supportingFact: "We won two penalty shootouts in the 2022 World Cup, led by Emiliano Martínez's heroics."
    },
    international_performance: {
      counterpoint: "We are the absolute kings of South American and global football in this era.",
      supportingFact: "We are the reigning Copa América and World Cup champions, winning three major titles in three years."
    },
    trophies: {
      counterpoint: "Trophies are the only proof of historical dominance, and our cabinet is full.",
      supportingFact: "We have won 3 FIFA World Cups and a record-tying 16 Copa América trophies."
    },
    records: {
      counterpoint: "We hold the longest unbeaten run in South American international football history.",
      supportingFact: "We went on a historic 36-game unbeaten streak under Lionel Scaloni from 2019 to 2022."
    },
    consistency: {
      counterpoint: "We have consistently reached the final stages of major tournaments over the last decade.",
      supportingFact: "We reached the World Cup final in 2014, and won Copa América (2021), World Cup (2022), and Copa América (2024)."
    },
    team_dependency: {
      counterpoint: "We are a cohesive unit where every player sacrifices their individual stats for the team.",
      supportingFact: "Our tactical press and defensive organization allowed us to win the Copa América with only 2 goals conceded."
    },
    physicality: {
      counterpoint: "We combine aggressive South American grit with elite defensive positioning.",
      supportingFact: "Our defensive line led by Romero and Otamendi is regarded as the most aggressive in world football."
    },
    mentality: {
      counterpoint: "Our mentality is unshakable; we bounce back from setbacks to win it all.",
      supportingFact: "After losing our opening match in 2022 to Saudi Arabia, we won six consecutive games to claim the World Cup."
    },
    peak_performance: {
      counterpoint: "Our current era is the most dominant peak in Argentine football history.",
      supportingFact: "We won the Copa América, Finalissima, and World Cup back-to-back, a feat never done by a South American team."
    }
  },
  brazil: {
    goals: {
      counterpoint: "Our goalscoring is an art form, defined by flair and explosive attacking talent.",
      supportingFact: "We are the all-time top scoring nation in World Cup history, with over 230 goals scored."
    },
    awards: {
      counterpoint: "Our legends have won more individual awards in football history than any other nation.",
      supportingFact: "Brazilian players have won the FIFA World Player of the Year award a record 8 times."
    },
    world_cup: {
      counterpoint: "The World Cup is our tournament; we are the only nation to win it five times.",
      supportingFact: "We hold a record 5 FIFA World Cup trophies (1958, 1962, 1970, 1994, 2002) and have never missed a tournament."
    },
    champions_league: {
      counterpoint: "Brazilian players are the decisive stars in almost every Champions League winning squad.",
      supportingFact: "Stars like Vinícius Jr., Neymar, Kaká, and Ronaldinho have scored in and won UCL finals."
    },
    dribbling: {
      counterpoint: "Dribbling is the core of Jogo Bonito—it is how we express our footballing identity.",
      supportingFact: "Garrincha, Pelé, Ronaldinho, and Neymar are universally regarded as the greatest dribblers in history."
    },
    playmaking: {
      counterpoint: "Our playmaking is creative, spontaneous, and impossible for structured defenses to predict.",
      supportingFact: "Legends like Pelé, Zico, and Ronaldinho defined the role of the creative playmaker."
    },
    passing: {
      counterpoint: "We combine passing precision with vertical pace to slice open deep blocks.",
      supportingFact: "Our 1970 World Cup team is widely regarded as the greatest passing squad in football history."
    },
    assists: {
      counterpoint: "Our teams play with a fluid, attacking philosophy that generates assists from fullbacks and forwards alike.",
      supportingFact: "Dani Alves and Cafu are among the highest-assisting fullbacks in the history of the sport."
    },
    leadership: {
      counterpoint: "Our leaders captain with authority, raising cups with pride and confidence.",
      supportingFact: "Cafu is the only player to play in three consecutive World Cup finals, captaining the team to victory in 2002."
    },
    longevity: {
      counterpoint: "We produce world-class talent that remains at the top of European football for decades.",
      supportingFact: "Thiago Silva captained Chelsea to a UCL title at 36 and played at the highest level past 39."
    },
    league_adaptability: {
      counterpoint: "Brazilian players adapt instantly and dominate the English, Spanish, Italian, and German leagues.",
      supportingFact: "We have had domestic league champions and golden boot winners in Premier League, La Liga, and Serie A."
    },
    clutch_performances: {
      counterpoint: "When it comes to World Cup finals, our record of delivering under pressure is unmatched.",
      supportingFact: "We have won 5 out of the 6 World Cup finals we have contested, showing elite final efficiency."
    },
    international_performance: {
      counterpoint: "We are the undisputed historic powerhouse of international football.",
      supportingFact: "We have won 5 World Cups, 9 Copa Américas, and 4 FIFA Confederations Cups."
    },
    trophies: {
      counterpoint: "Trophies are the only currency that matters in football, and we have the most valuable collection.",
      supportingFact: "We have won a record 5 FIFA World Cups, the most prestigious trophy in all of sports."
    },
    records: {
      counterpoint: "Our records are the foundation of international football history.",
      supportingFact: "We hold the record for most World Cup wins (76), most goals scored, and most consecutive qualifications."
    },
    consistency: {
      counterpoint: "We are the only nation to qualify and play in every single World Cup tournament in history.",
      supportingFact: "We have played in all 22 World Cup tournaments, a record of consistency that will never be broken."
    },
    team_dependency: {
      counterpoint: "Our squads are built around collective flair, allowing individual geniuses to express themselves.",
      supportingFact: "Our 1970 and 2002 squads featured multiple world-class stars clicking in perfect harmony."
    },
    physicality: {
      counterpoint: "We combine our natural flair with explosive pace, athletic power, and physical defense.",
      supportingFact: "Our squad has featured physically dominant monsters like Ronaldo Nazário and Adriano."
    },
    mentality: {
      counterpoint: "We play with joy and without fear, making us impossible to contain when we find our rhythm.",
      supportingFact: "Our Jogo Bonito philosophy has inspired millions of players to play football with absolute freedom."
    },
    peak_performance: {
      counterpoint: "Our peak squads are universally regarded as the greatest teams ever to touch a football.",
      supportingFact: "Our 1970 World Cup winning team won every single match in qualification and the tournament."
    }
  }
};
