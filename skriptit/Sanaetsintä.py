# Tämä tiedosto sisältää algoritmin,
# jolla voidaan löytää linkki aloitus- ja lopetussanan välillä

# Algoritmin nopeuden testaaminen yksinkertaisesti
import datetime

# Algoritmin toiminnalle tärkeää
from collections import deque
import random

# Palauttaa listan, joka sisältää kaikki sanat aloitussanasta lopetussanaan
def ReittiAloituksestaLopetukseen(sana_solmut: dict, tavoite_sana: str):
    reitti = []
    solmu = tavoite_sana
    while sana_solmut[solmu] != None:
        reitti.append(solmu)
        solmu = sana_solmut[solmu]
    reitti.append(solmu)
    return reversed(reitti)

def SanakirjanLuonti(sanat: list):
    sanakirja = {}
    for sana in sanat:
        sanakirja[sana.strip()] = 1
    return sanakirja

# Etsii nopeimman reitin aloitussanasta lopetussanaan
# Esimerkki palautus, kun ReitinLöytöAlgoritmi(pässi, kassi, sanakirja)
# [{kassi: passi, passi: pässi, pässi: None}, 2]
def ReitinLöytöAlgoritmi(aloitus_sana: str, tavoite_sana: str, sanakirja: dict):

    # Tarkistetaan, että aloitusvaatimukset on täytetty
    if aloitus_sana == tavoite_sana:
        return (None, 0)

    elif tavoite_sana not in sanakirja:
        return (None, 0)
   
    # Sana_solmut = {sana: sanan vanhempi, sanan vanhempi: sanan vanhemman vanhempi}
    # 'Vanhemmalla' tarkoitetaan sanaa, josta nykyiseen sanaan päädyttiin.
    sana_solmut = {}
    # Aloitus_sanalla ei ole vanhempia, joten sen arvoksi tulee None.
    sana_solmut[aloitus_sana] = None
    # Taso kuvaaketjun pituutta
    # eli sitä kuinka monen askeleen sanan päässä ollaan aloitus_sanasta
    taso, sanan_pituus = 0, len(aloitus_sana)

    # Lisätään sanoja jonoon aloittamalla aloitus_sanasta
    Q = deque()
    Q.append(aloitus_sana)

    while (len(Q) > 0):
       
        # Ilmaistaan ketjun pituuden kasvu
        taso += 1

        # Jonon nykyinen koko
        Qkoko = len(Q)

        # Käydään läpi tähän mennessä jonoon tulleet elementit
        for i in range(Qkoko):
            sana = [j for j in Q.popleft()]
            vanhempi = "".join(sana)

            for pos in range(sanan_pituus):
               
                alkuperäinen_kirjain = sana[pos]
               
                # korvataan jokaisella mahdollisella kirjaimella
                for c in range(ord('a'), ord('ö') + 1):
                    sana[pos] = chr(c)
                   
                    # Tarkistetaan ollaanko tavoite_sana saavutettu
                    if ("".join(sana) == tavoite_sana):
                        sana_solmut[tavoite_sana] = vanhempi
                        return (sana_solmut, taso)
                   
                    # Jatketaan seuraavaan kirjaimeen, jos sana ei löydy sanakirjasta
                    if (''.join(sana) not in sanakirja):
                        continue
                   
                    # Jos sana ei ole sen vanhempi, niin luodaan
                    # kirjaus sana_solmut sanakirjaan
                    # ja poistetaan sana sanakirjasta,
                    # jotta sitä ei käytettäisi uudelleen
                    if "".join(sana) != vanhempi:
                        sana_solmut["".join(sana)] = vanhempi
                    del sanakirja["".join(sana)]

                    # Lisätään uusi sana jonoon
                    Q.append(''.join(sana))
               
                # Palautetaan sanan alkuperäinen kirjain
                sana[pos] = alkuperäinen_kirjain

    # Reittiä ei löytynyt            
    return (None, 0)

def MahdollisetTavoiteSanat(aloitus_sana: str, min_taso: int, max_taso: int, sanakirja: dict):
   
    # Taso kuvaaketjun pituutta
    # eli sitä kuinka monen askeleen sanan päässä ollaan aloitus_sanasta
    taso, sanan_pituus = 0, len(aloitus_sana)

    # Lista mahdollisista tavoitesanoista
    mahdolliset_tavoitesanat = []

    # Lisätään sanoja jonoon aloittamalla aloitus_sanasta
    Q = deque()
    Q.append(aloitus_sana)

    while (len(Q) > 0) and taso < max_taso:
       
        # Ilmaistaan ketjun pituuden kasvu
        taso += 1

        # Jonon nykyinen koko
        Qkoko = len(Q)

        # Käydään läpi tähän mennessä jonoon tulleet elementit
        for i in range(Qkoko):
            sana = [j for j in Q.popleft()]

            for pos in range(sanan_pituus):

                alkuperäinen_kirjain = sana[pos]
               
                # korvataan jokaisella mahdollisella kirjaimella
                for c in range(ord('a'), ord('ö') + 1):
                    sana[pos] = chr(c)
                   
                    # Jatketaan seuraavaan kirjaimeen, jos sana ei löydy sanakirjasta
                    if (''.join(sana) not in sanakirja):
                        continue
                    if taso >= min_taso:
                        mahdolliset_tavoitesanat.append([''.join(sana), taso])
                    del sanakirja["".join(sana)]

                    # Lisätään uusi sana jonoon
                    Q.append(''.join(sana))

                # Palautetaan sanan alkuperäinen kirjain
                sana[pos] = alkuperäinen_kirjain

    # Reittiä ei löytynyt            
    return mahdolliset_tavoitesanat

def ReitinLöytäminen(aloitus_sana: str, tavoite_sana: str, sanat: list, suorituskyky = False):
    if suorituskyky:
        aloitusaika = datetime.datetime.now()

    sanakirja = SanakirjanLuonti(sanat)
   
    sana_solmut, taso = ReitinLöytöAlgoritmi(aloitus_sana, tavoite_sana, sanakirja)
    if sana_solmut == None:
        return (None, 0)

    if suorituskyky:
        lopetusaika = datetime.datetime.now()
        print(lopetusaika - aloitusaika)
    return (ReittiAloituksestaLopetukseen(sana_solmut, tavoite_sana), taso)

   

           

           