import {WhoWeAreSection} from "../../../../../types/admin/who-we-are";

interface BaseProps{
section: WhoWeAreSection
}
export const BaseSection = ({section}: BaseProps) => {

    return(<section>
        <div>
            {section.contents.map((c)=> (
                <
            ))}
        </div>
    </section>)
}