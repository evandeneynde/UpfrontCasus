<?php

namespace Database\Seeders;

use App\Models\TrainingQuestion;
use App\Models\TrainingStep;
use Illuminate\Database\Seeder;

class TrainingStepSeeder extends Seeder
{
    /**
     * Seed the training steps and their questions.
     */
    public function run(): void
    {
        $steps = [
            [
                'title' => 'Afwegen van bulk ingrediënten bij het weegstation',
                'description' => 'Leer hoe je bulk ingrediënten nauwkeurig afweegt en registreert.',
                'video_id' => null,
                'questions' => [
                    [
                        'question' => 'Wat is de juiste eerste handeling bij het weegstation?',
                        'options' => [
                            'De grondstoffen alvast klaarzetten en openen',
                            'De weegschaal op nul zetten (tarra) en het recept controleren',
                            'Alle ingrediënten tegelijk afwegen',
                            'Het weegstation reinigen',
                        ],
                        'correct_option' => 1,
                    ],
                ],
            ],
            [
                'title' => 'De ingrediënten zeven in de IBC container',
                'description' => 'Zeven verwijdert klontjes en zorgt voor een homogeen mengsel in de IBC.',
                'video_id' => null,
                'questions' => [
                    [
                        'question' => 'Wat doe je nadat alle ingrediënten door de zeef zijn gegaan?',
                        'options' => [
                            'Direct de IBC afsluiten en doorgaan naar het mixen',
                            'Controleer visueel of de IBC goed en volledig gevuld is',
                            'De IBC opnieuw wegen om het gewicht te bevestigen',
                            'Het zeef terugplaatsen zonder reiniging',
                        ],
                        'correct_option' => 1,
                    ],
                ],
            ],
            [
                'title' => 'IBC in de mixer zetten en mixen',
                'description' => 'Correct mixen is essentieel voor een homogeen eindproduct.',
                'video_id' => null,
                'questions' => [
                    [
                        'question' => 'Hoe bepaal je de mengduur?',
                        'options' => [
                            'Altijd precies 10 minuten, ongeacht het recept',
                            'Aan het geluid van de mixer',
                            'Zoals aangegeven in het recept of de werkinstructie',
                            'Tot de operator besluit dat het er goed uitziet',
                        ],
                        'correct_option' => 2,
                    ],
                    [
                        'question' => 'Wat registreer je na het mixen in het systeem?',
                        'options' => [
                            'Alleen de starttijd van het mixen',
                            'De naam van de operator die gemixed heeft',
                            'De werkelijke mengtijd',
                            'Niets, de mixer registreert dit automatisch',
                        ],
                        'correct_option' => 2,
                    ],
                ],
            ],
            [
                'title' => 'IBC aansluiten op de automatische afvullijn',
                'description' => 'Een correcte aansluiting voorkomt lekkage en productieverlies.',
                'video_id' => null,
                'questions' => [
                    [
                        'question' => 'Wat controleer je VOOR je de klep van de IBC opent?',
                        'options' => [
                            'Of de volgende batch al klaarstaat',
                            'Of de slang correct is aangesloten en de afvulmachine klaarstaat',
                            'Of de vloer rondom de machine droog is',
                            'Het aantal beschikbare lege zakken',
                        ],
                        'correct_option' => 1,
                    ],
                    [
                        'question' => 'Hoe open je de klep van de IBC?',
                        'options' => [
                            'Zo snel mogelijk om tijd te besparen',
                            'Langzaam en gecontroleerd nadat alles correct is aangesloten',
                            'Met behulp van specifiek gereedschap',
                            'Volledig open in één snelle beweging',
                        ],
                        'correct_option' => 1,
                    ],
                ],
            ],
            [
                'title' => 'Afvulmachine vult de zakken en sealt deze',
                'description' => 'Controleer gewicht en sealing om productkwaliteit te garanderen.',
                'video_id' => null,
                'questions' => [
                    [
                        'question' => 'Welke controles voer je uit bij de eerste zakken?',
                        'options' => [
                            'Alleen of de zak goed dicht zit',
                            'Gewicht, sealing en leesbaarheid van de barcode',
                            'Alleen het gewicht op de weegschaal',
                            'Geen controle — de machine is gecalibreerd',
                        ],
                        'correct_option' => 1,
                    ],
                    [
                        'question' => 'Wanneer schakel je de afvulmachine uit?',
                        'options' => [
                            'Nooit tijdens een lopende productierun',
                            'Bij storing, afwijkend gewicht of een slechte sealing',
                            'Na elke 100 zakken voor een routinecontrole',
                            'Alleen als de IBC volledig leeg is',
                        ],
                        'correct_option' => 1,
                    ],
                ],
            ],
            [
                'title' => 'Zakken van de band pakken en op een pallet plaatsen',
                'description' => 'Correct palletiseren zorgt voor veilig transport en opslag.',
                'video_id' => null,
                'questions' => [
                    [
                        'question' => 'Hoe stapel je zakken op de pallet?',
                        'options' => [
                            'Zo snel mogelijk — volgorde maakt niet uit',
                            'Volgens het vastgestelde stapelpatroon per laag',
                            'Altijd met het etiket naar de binnenkant',
                            'Zo hoog mogelijk voor maximale benutting',
                        ],
                        'correct_option' => 1,
                    ],
                    [
                        'question' => 'Wat doe je nadat de pallet volledig beladen is?',
                        'options' => [
                            'Direct doorrijden naar het magazijn',
                            'Het aantal zakken registreren en de pallet inpakken met stretchfolie',
                            'Een nieuw etiket plakken en wachten',
                            'Wachten op instructies van de supervisor',
                        ],
                        'correct_option' => 1,
                    ],
                ],
            ],
        ];

        foreach ($steps as $sortOrder => $stepData) {
            $step = TrainingStep::create([
                'sort_order' => $sortOrder,
                'title' => $stepData['title'],
                'description' => $stepData['description'],
                'video_id' => $stepData['video_id'],
            ]);

            foreach ($stepData['questions'] as $qOrder => $q) {
                TrainingQuestion::create([
                    'training_step_id' => $step->id,
                    'sort_order' => $qOrder,
                    'question' => $q['question'],
                    'options' => $q['options'],
                    'correct_option' => $q['correct_option'],
                ]);
            }
        }
    }
}
