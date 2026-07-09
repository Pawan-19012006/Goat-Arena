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
    },
    early_career: {
      counterpoint: "Starting young is interesting, but football greatness is measured by what happens after the debut, not the debut itself.",
      supportingFact: "He made his Sporting CP debut at 17, immediately scoring a brace, and was signed by Manchester United that same year."
    },
    career_start: {
      counterpoint: "A player's starting point is just a preface. What matters is the drive to conquer the toughest leagues in the world.",
      supportingFact: "He left Portugal as a teenager to challenge himself in England, scoring in FA Cup finals and Champions League campaigns early on."
    },
    academy_development: {
      counterpoint: "Academy development is about building training discipline, not just being babied by one local club's system.",
      supportingFact: "Sporting CP's academy polished his raw speed, making him the only youth player to play for the U16, U17, U18, B-team, and first team in one season."
    },
    youth_talent: {
      counterpoint: "Youth hype is easy to generate, but converting raw talent into five Ballon d'Ors requires unmatched work ethic.",
      supportingFact: "He was signed by Manchester United at age 18 after he completely dismantled their defense in a 2003 pre-season friendly."
    },
    natural_ability: {
      counterpoint: "Natural gifts are useless without the physical strength and tactical discipline to execute them under pressure.",
      supportingFact: "His technical mastery was so high that legendary defenders described him as a physical and skill-based nightmare."
    },
    fanbase: {
      counterpoint: "Fan counts follow elite performance. He has the largest fanbase because he has delivered in the biggest moments.",
      supportingFact: "He is the most followed person in the world across social media, showing his unprecedented cultural influence."
    },
    influence: {
      counterpoint: "True influence is global. He inspires generations of athletes across sports to master their physical limits.",
      supportingFact: "His extreme physical preparation changed how professional football players manage their recovery and careers worldwide."
    },
    popularity: {
      counterpoint: "Popularity is a byproduct of absolute dominance on the pitch, not media marketing campaigns.",
      supportingFact: "He holds the record for the highest attendance at a player presentation, with 80,000 fans filling the Bernabéu."
    },
    legacy: {
      counterpoint: "Legacy is defined by winning in different leagues and carrying teams, not comfort zone dominance.",
      supportingFact: "He left a historic legacy as the all-time top scorer of Real Madrid, Champions League, and international football."
    },
    potential: {
      counterpoint: "Potential is just talk. He actually realized his potential to become the greatest goalscorer in history.",
      supportingFact: "He went from a skinny winger in Madeira to a 5-time Champions League winner and global icon."
    },
    football_iq: {
      counterpoint: "IQ isn't just passing backward. Moving off-the-ball and creating space is the highest form of football intelligence.",
      supportingFact: "His transition from a tricky dribbler to a lethal box movement specialist shows unmatched tactical intelligence."
    },
    skill: {
      counterpoint: "Skill is about efficiency, not just showboating in non-dangerous zones.",
      supportingFact: "He combined stepovers, elasticos, and speed to beat defenders in the physical Premier League before translating it into direct goals."
    },
    vision: {
      counterpoint: "Vision is about seeing the final run and making the vertical pass, not just switching play sideways.",
      supportingFact: "His quick vision and movement off-the-ball generated over 250 assists and hundreds of key passes."
    },
    creativity: {
      counterpoint: "Creativity is most effective in the final third where it directly creates goals, not in the middle of the pitch.",
      supportingFact: "He created a high volume of goals in Manchester, Madrid, and Turin, leading three distinct attacking systems."
    },
    technique: {
      counterpoint: "Technique is useless without physical power to enforce it in highly physical leagues.",
      supportingFact: "His shooting technique, including his famous knuckleball free-kicks and weak-foot power, set the standard."
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
    },
    early_career: {
      counterpoint: "A player's early debut is the ultimate sign of unmatched talent. He was already better than grown professionals.",
      supportingFact: "He joined Barcelona's La Masia at 13 and made his senior debut at 16, quickly becoming the core of the greatest club team ever."
    },
    career_start: {
      counterpoint: "Starting your career at one of the highest-pressure clubs in the world and immediately excelling shows historic class.",
      supportingFact: "He was already a regular starter for Barcelona and scoring in El Clásico matches before he turned 19."
    },
    academy_development: {
      counterpoint: "La Masia is the greatest academy in football history, and he is its crowning achievement.",
      supportingFact: "He swept through the youth ranks at La Masia, scoring 36 goals in 30 games for the legendary Cadete A team."
    },
    youth_talent: {
      counterpoint: "True youth talent is about absolute technical dominance, not just physical acceleration.",
      supportingFact: "He won the Golden Ball and Golden Boot at the 2005 FIFA World Youth Championship at just 18."
    },
    natural_ability: {
      counterpoint: "Natural gifts are what separate him from hard-working athletes; you cannot manufacture his control.",
      supportingFact: "His low center of gravity and close control are statistically the most efficient and natural ever seen."
    },
    fanbase: {
      counterpoint: "His fanbase appreciates the beauty and logic of playmaking, not just marketing and social media profiles.",
      supportingFact: "His MLS move to Inter Miami drew record global sports viewership and sold out stadiums across North America."
    },
    influence: {
      counterpoint: "His influence is in how players approach technical skill and playmaking, inspiring the purists of the sport.",
      supportingFact: "He is cited by almost every modern playmaker as the blueprint of what a complete creative forward should be."
    },
    popularity: {
      counterpoint: "Popularity is secondary to the universal respect he receives from actual football managers and peers.",
      supportingFact: "He has won the Laureus World Sportsman of the Year award twice, a record for a team sport athlete."
    },
    legacy: {
      counterpoint: "His legacy is complete. He won every major trophy available, including the World Cup, Copa América, and 8 Ballon d'Ors.",
      supportingFact: "He is universally acclaimed by peers and managers as the most complete footballer in history."
    },
    potential: {
      counterpoint: "He is the only prodigy who exceeded his massive initial potential to become the undisputed GOAT.",
      supportingFact: "He was hyped as the next Maradona at 18 and ended up winning more trophies than Maradona ever did."
    },
    football_iq: {
      counterpoint: "His vision allows him to control the entire pitch, finding passes that other players cannot even see.",
      supportingFact: "He has the highest number of line-breaking passes and assists in modern football history."
    },
    skill: {
      counterpoint: "Skill is about control and efficiency, not stepovers that lead nowhere.",
      supportingFact: "His simple body drops and body swerves allow him to bypass multiple defenders without wasting motion."
    },
    vision: {
      counterpoint: "His vision is unmatched, seeing passing lanes before defenders can even close them.",
      supportingFact: "He has won the IFFHS World's Best Playmaker award 5 times, a record in modern football."
    },
    creativity: {
      counterpoint: "He is the most creative player in history, combining elite goalscoring with historic assist numbers.",
      supportingFact: "He holds the all-time record for the most assists in football history, with over 360 career assists."
    },
    technique: {
      counterpoint: "His technical touch and execution are the most precise in the history of the sport.",
      supportingFact: "His free-kick conversion rate and close-control dribbling metrics are the highest in modern football."
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
    },
    early_career: {
      counterpoint: "His early career explosion shows he was built for the biggest stage from day one.",
      supportingFact: "He led Monaco to a Ligue 1 title and UCL semi-final at age 18, scoring against City, Dortmund, and Juve."
    },
    career_start: {
      counterpoint: "Starting at Monaco and immediately matching historic records shows his generational talent.",
      supportingFact: "He became Monaco's youngest-ever first-team player at 16, breaking Thierry Henry's record."
    },
    academy_development: {
      counterpoint: "Monaco's academy has produced the greatest talents in French history, and he is their best.",
      supportingFact: "His rapid development at Monaco saw him transition from youth prospects to Ligue 1 champion in 18 months."
    },
    youth_talent: {
      counterpoint: "He is the most successful youth talent of this generation, winning a World Cup before turning 20.",
      supportingFact: "He won the Best Young Player award at the 2018 World Cup after scoring 4 goals in Russia."
    },
    natural_ability: {
      counterpoint: "His speed and coordination are natural attributes that cannot be taught.",
      supportingFact: "His direct style of play and acceleration make him the most dangerous 1v1 threat in Europe."
    },
    fanbase: {
      counterpoint: "His fanbase spans the globe, inspired by his electrifying speed and big-match displays.",
      supportingFact: "He is one of the most followed young athletes globally, driving massive shirt sales and media views."
    },
    influence: {
      counterpoint: "His influence is in how he represents the modern, dynamic French generation of football.",
      supportingFact: "He was named on the Time 100 list of the most influential people in the world."
    },
    popularity: {
      counterpoint: "His popularity is earned by scoring hat-tricks in World Cup finals, not marketing hype.",
      supportingFact: "His transfer to Real Madrid drew over 85,000 fans to the stadium for his presentation."
    },
    legacy: {
      counterpoint: "His legacy is already secure with a World Cup trophy and multiple scoring records.",
      supportingFact: "He is already the second-highest scorer in World Cup history for France at just 25."
    },
    potential: {
      counterpoint: "His potential is to win multiple Ballon d'Ors and conquer Europe with Real Madrid.",
      supportingFact: "At 25, he has already achieved goalscoring numbers that most legends hit at their career peak."
    },
    football_iq: {
      counterpoint: "His tactical IQ allows him to find spaces in transitions and exploit them with speed.",
      supportingFact: "His movement off the shoulder of defenders is statistically the most efficient in modern football."
    },
    skill: {
      counterpoint: "His skill is using his acceleration to destroy defenders, which is highly effective.",
      supportingFact: "He uses direct ball rolls, stepovers, and changes of pace to dominate the left flank."
    },
    vision: {
      counterpoint: "His vision in transitions allows him to pick out runners while moving at high speeds.",
      supportingFact: "He has registered over 120 career assists alongside his massive scoring output."
    },
    creativity: {
      counterpoint: "Creativity is about creating goals, and he creates them through pace and quick cutbacks.",
      supportingFact: "He consistently ranks in the top tier for progressive carries and key passes in Europe."
    },
    technique: {
      counterpoint: "His shooting technique allows him to curl the ball into the far corner with high consistency.",
      supportingFact: "His clinical finishing stats in 1v1s against goalkeepers are the highest in Ligue 1 history."
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
    },
    early_career: {
      counterpoint: "Starting in Norway and Austria allowed him to build raw scoring power away from media hype.",
      supportingFact: "He scored 9 goals in a single match at the 2019 FIFA U-20 World Cup, alerting the world to his talent."
    },
    career_start: {
      counterpoint: "Starting in Salzburg and scoring back-to-back hat-tricks in UCL shows his generational class.",
      supportingFact: "He became the first teenager to score in five consecutive Champions League matches."
    },
    academy_development: {
      counterpoint: "His youth development focused on physical growth and positioning, preparing him for the Premier League.",
      supportingFact: "He transitioned from Bryne's academy directly into Salzburg, polishing his finishing under Jesse Marsch."
    },
    youth_talent: {
      counterpoint: "He is the most dominant youth scorer of this era, scoring in almost every appearance.",
      supportingFact: "He scored 28 goals in 22 games for Salzburg before moving to Dortmund at age 19."
    },
    natural_ability: {
      counterpoint: "His height, strength, and spatial awareness are natural gifts that make him a perfect target man.",
      supportingFact: "His physical size allows him to overpower defenders while running at speeds over 36 km/h."
    },
    fanbase: {
      counterpoint: "His fanbase loves his robotic, clinical efficiency and humorous post-match interviews.",
      supportingFact: "He is one of the most marketed young stars in world football, driving massive Premier League interest."
    },
    influence: {
      counterpoint: "His influence is in showing that the classic number 9 striker is still highly dominant in modern tactical systems.",
      supportingFact: "His signing changed how Manchester City approach attacking transitions under Pep Guardiola."
    },
    popularity: {
      counterpoint: "His popularity is earned by breaking the Premier League scoring record, not media campaigns.",
      supportingFact: "His Manchester City presentation drew over 10,000 fans to the stadium."
    },
    legacy: {
      counterpoint: "He has already left a legacy by winning a treble and breaking historic scoring records in England.",
      supportingFact: "He is the youngest player to win the UEFA Men's Player of the Year award."
    },
    potential: {
      counterpoint: "His potential is to break all-time scoring records in Champions League and Premier League history.",
      supportingFact: "At age 23, he has already scored more Champions League goals than many legendary forwards did in their entire careers."
    },
    football_iq: {
      counterpoint: "A striker's IQ is about spatial awareness and timing runs to escape defenders, which he does perfectly.",
      supportingFact: "His off-ball positioning allows him to score tap-ins that look easy but require elite reading of the ball."
    },
    skill: {
      counterpoint: "His skill is finishing. He doesn't need stepovers when one touch is enough to put the ball in the net.",
      supportingFact: "His conversion rate in the box is statistically the highest in the Premier League."
    },
    vision: {
      counterpoint: "His vision is focused on locating the goal and the position of the goalkeeper under pressure.",
      supportingFact: "He converted over 30% of his total shots into goals, showing elite target vision."
    },
    creativity: {
      counterpoint: "His creativity is in his movement, generating spaces for midfielders like De Bruyne to exploit.",
      supportingFact: "His presence in the box draws multiple defenders, creating space for teammates to score."
    },
    technique: {
      counterpoint: "His technique is optimized for high-power, clinical finishing with both feet and his head.",
      supportingFact: "His airborne and acrobatic goals show a rare technical flexibility for a player of his height."
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
    },
    early_career: {
      counterpoint: "Our early career development is built on introducing youngsters into competitive first division leagues early.",
      supportingFact: "Legends like Messi, Maradona, and Agüero made senior professional debuts in Argentina and Spain before age 17."
    },
    career_start: {
      counterpoint: "Our players start under intense pressure in historic domestic clubs like Boca Juniors and River Plate.",
      supportingFact: "This raw football culture prepares our players to transition seamlessly to elite European leagues."
    },
    academy_development: {
      counterpoint: "Our academies in Buenos Aires and Rosario are historic production lines of technical talent.",
      supportingFact: "Academies like River Plate, Boca, and Newell's Old Boys have produced multiple Ballon d'Or winners and global icons."
    },
    youth_talent: {
      counterpoint: "We have historically dominated international youth championships, proving our grass-roots quality.",
      supportingFact: "We have won the FIFA U-20 World Cup a record 6 times, showcasing our unmatched youth production."
    },
    natural_ability: {
      counterpoint: "The street football culture of Argentina develops raw technical skill that structured academies cannot match.",
      supportingFact: "This creates players with unparalleled low centers of gravity, ball retention, and close-control dribbling."
    },
    fanbase: {
      counterpoint: "Our fans are the most passionate in the world, turning stadiums into walls of sound.",
      supportingFact: "Our fans won the FIFA Fan Award in 2022 for their historic support and atmosphere in Qatar."
    },
    influence: {
      counterpoint: "Our footballing style has influenced global football tactics, from Bielsa's press to Maradona's flair.",
      supportingFact: "Our managers have won domestic league titles and continental trophies across Europe and South America."
    },
    popularity: {
      counterpoint: "Our popularity is driven by a deep global love for our style of play and historic football culture.",
      supportingFact: "The 2022 World Cup victory parade in Buenos Aires drew over 4 million fans, the largest sporting gathering in history."
    },
    legacy: {
      counterpoint: "Our legacy is built on producing the absolute peaks of football history—Maradona and Messi.",
      supportingFact: "We are the only nation to produce two different players universally recognized as the greatest of their eras."
    },
    potential: {
      counterpoint: "We consistently produce young talents who achieve their potential at the highest levels in Europe.",
      supportingFact: "Enzo Fernández and Julián Álvarez went from River Plate to winning the World Cup and Champions League in one year."
    },
    football_iq: {
      counterpoint: "Our tactical intelligence allows us to master defensive blocks and mid-blocks in tournament formats.",
      supportingFact: "Lionel Scaloni's tactical adjustments in the 2022 World Cup nullified the midfield of Croatia and France."
    },
    skill: {
      counterpoint: "Our skill is functional, focused on keeping the ball under extreme pressure and winning fouls.",
      supportingFact: "We hold the highest stats for progressive passes and fouls drawn in international tournaments."
    },
    vision: {
      counterpoint: "Our vision is highlighted by quick, direct playmaking that creates goals out of low-percentage situations.",
      supportingFact: "Messi's assist against Netherlands in 2022 is widely regarded as one of the greatest passes in World Cup history."
    },
    creativity: {
      counterpoint: "Our creative play is built on quick link-up combinations in the final third.",
      supportingFact: "Our fluid transition play led to Argentina scoring twice in the first half of the 2022 World Cup Final."
    },
    technique: {
      counterpoint: "Our technical accuracy allows us to maintain control and tempo in highly physical matches.",
      supportingFact: "Our penalty conversion rate is the highest in World Cup history, winning a record 6 shootouts."
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
    },
    early_career: {
      counterpoint: "Our youngsters explode onto the professional scene with a confidence and flair that is uniquely Brazilian.",
      supportingFact: "Pelé made his international debut at 16, scoring against Argentina, and won his first World Cup at 17."
    },
    career_start: {
      counterpoint: "Starting in Brazil's tough state championships develops incredible technical flair under heavy contact.",
      supportingFact: "Neymar won the Copa Libertadores with Santos and was nominated for the Ballon d'Or while still playing in Brazil."
    },
    academy_development: {
      counterpoint: "Our academies like Santos, Flamengo, and São Paulo have produced some of the most skilled players in history.",
      supportingFact: "Santos' academy alone produced Pelé, Robinho, and Neymar, establishing a historic pipeline of attacking genius."
    },
    youth_talent: {
      counterpoint: "Our youth talent is historically the most scouted and coveted by the biggest European clubs.",
      supportingFact: "Real Madrid signed Vinícius Jr. and Rodrygo before they turned 18, immediately making them core starters."
    },
    natural_ability: {
      counterpoint: "Our players are born with samba in their feet and an innate technical control that cannot be taught.",
      supportingFact: "This natural ability is why Brazil has produced the highest number of Ballon d'Or winners in South America."
    },
    fanbase: {
      counterpoint: "We have the largest, most joyful fanbase that turns every match into a carnival celebration.",
      supportingFact: "Our national yellow jersey is the most iconic and widely sold sports shirt in the history of the world."
    },
    influence: {
      counterpoint: "Our style of play, Jogo Bonito, has shaped how the entire world views football as an art form.",
      supportingFact: "We popularized attacking wingbacks (like Roberto Carlos and Dani Alves) and creative number 10s globally."
    },
    popularity: {
      counterpoint: "Our popularity is a reflection of our historic dominance and the beautiful style of football we play.",
      supportingFact: "We are universally loved by neutral fans as the second national team of almost every football lover."
    },
    legacy: {
      counterpoint: "Our legacy is the absolute gold standard of international football, with a record 5 stars on our chest.",
      supportingFact: "No other nation has won World Cups across four different continents, showing our global legacy."
    },
    potential: {
      counterpoint: "We produce an endless supply of talent with the potential to win Champions Leagues and Ballon d'Ors.",
      supportingFact: "Young stars like Endrick and Vitor Roque represent the next generation carrying the historic legacy."
    },
    football_iq: {
      counterpoint: "Our football IQ is about spatial intelligence and improvisation under heavy pressure.",
      supportingFact: "Ronaldinho's look-away passes and Pelé's dummy runs show the highest level of creative football IQ."
    },
    skill: {
      counterpoint: "Our skill is the highest in the world, combining stepovers, rainbow flicks, and samba control.",
      supportingFact: "We are universally recognized as the originators of dribbling tricks and skill-based attacking football."
    },
    vision: {
      counterpoint: "Our vision is spontaneous, allowing us to find creative passing angles that structured systems cannot predict.",
      supportingFact: "Neymar's quick chips and Zico's backheel passes are legendary examples of creative vision."
    },
    creativity: {
      counterpoint: "Our creativity is the essence of Jogo Bonito, turning match play into a creative performance.",
      supportingFact: "Our 1982 World Cup squad is widely cited as the most creative and watchable team in history."
    },
    technique: {
      counterpoint: "Our technical execution allows us to execute complex skills at maximum speed.",
      supportingFact: "We have produced some of the greatest free-kick takers in history, including Juninho and Ronaldinho."
    }
  }
};
