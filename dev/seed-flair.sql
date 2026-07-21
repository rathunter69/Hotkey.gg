-- r384: dress the seed field — frames on seed profiles so clicked player cards
-- show the cosmetic economy. Distribution mirrors plausible earns.
update public.profiles set flair='heraldic'      where handle in ('CtrlFreak');
update public.profiles set flair='foil'          where handle in ('AltHero','VLookupVet');
update public.profiles set flair='plaque-diam'   where handle in ('FillDown');
update public.profiles set flair='plaque-plat'   where handle in ('TraceKing','MarginCall');
update public.profiles set flair='plaque-gold'   where handle in ('PasteSpecialist','RibbonRunner','ZeroDecimals');
update public.profiles set flair='plaque-silver' where handle in ('ParBreaker','GridLock','CompsCrusher');
update public.profiles set flair='plaque-bronze' where handle in ('AnchorMan','SheetShow','TabOrDie');
update public.profiles set flair='charter'       where handle in ('CommaChameleon','ScrubDaddy','GauntletGrace','UndoKing');
update public.profiles set flair='engraved'      where handle in ('LboLegend','CagrCadet','FxPhantom','BorderPatrol','RollupRick');
update public.profiles set flair='bone'          where handle in ('SumProduct');
